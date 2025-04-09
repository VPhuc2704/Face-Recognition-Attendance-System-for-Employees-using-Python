import { AuthEventType, TokenStatus } from '@/constants/type'
import { tokenService } from '@/services/token.service'
import { authEvents } from '@/utils/authEvent'
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Khai báo kiểu dữ liệu cho hàng đợi
interface QueueItem {
  resolve: (value: unknown) => void
  reject: (reason?: any) => void
  config: InternalAxiosRequestConfig
}

// Tạo instance Axios với cấu hình cơ bản
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // Thêm timeout để tránh request treo quá lâu
})

// Biến để theo dõi trạng thái refresh token
let isRefreshing = false
let failedQueue: QueueItem[] = []

/**
 * Xử lý hàng đợi các request bị lỗi 401
 * @param error Lỗi nếu có, null nếu refresh thành công
 * @param token Token mới nếu refresh thành công
 */
const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error)
    } else {
      item.config.headers.Authorization = `Bearer ${token}`
      item.resolve(api(item.config))
    }
  })

  // Xóa hàng đợi sau khi xử lý
  failedQueue = []
}

// Interceptor cho request - Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Nếu lỗi là 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Kiểm tra refresh token trước khi cố gắng refresh
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        handleAuthFailure()
        return Promise.reject(error)
      }

      // Kiểm tra tính hợp lệ của refresh token
      const refreshTokenStatus = tokenService.checkTokenStatus(refreshToken)
      if (refreshTokenStatus === TokenStatus.EXPIRED || refreshTokenStatus === TokenStatus.INVALID) {
        // Refresh token đã hết hạn, không cần thử refresh
        handleAuthFailure()
        return Promise.reject(error)
      }
      // Nếu đang refresh, thêm request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      // Đánh dấu request này đã thử refresh và bắt đầu quá trình refresh
      originalRequest._retry = true
      isRefreshing = true

      try {
        // Refresh token
        const newToken = await tokenService.refreshToken()

        if (!newToken) {
          throw new Error('Không thể refresh token')
        }
        // Cập nhật token mới cho request hiện tại và các request trong hàng đợi
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)

        // Thực hiện lại request ban đầu với token mới
        return api(originalRequest)
      } catch (err) {
        // Xử lý lỗi refresh token
        processQueue(err, null)

        handleAuthFailure()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // Xử lý các lỗi khác
    return Promise.reject(error)
  }
)

/**
 * Xử lý khi xác thực thất bại hoàn toàn
 */
function handleAuthFailure() {
  tokenService.clearTokens()
  authEvents.emit(AuthEventType.SESSION_EXPIRED)
}

export default api
