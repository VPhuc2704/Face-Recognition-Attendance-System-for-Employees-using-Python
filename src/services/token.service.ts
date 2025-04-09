import { AuthEventType, TokenPayload, TokenStatus } from '@/constants/type'
import { RefreshTokenBodyType } from '@/schemas/auth.schema'
import { jwtDecode } from 'jwt-decode'
import { authService } from './auth.service'
import { authEvents } from '@/utils/authEvent'

// Thời gian còn lại (giây) trước khi token hết hạn mà chúng ta cần refresh
const TOKEN_REFRESH_THRESHOLD = 60 * 5 // 5 phút
// Thời gian kiểm tra token định kỳ (ms)
const TOKEN_CHECK_INTERVAL = 15000 // 30 giây

let tokenMonitorInterval: number | null = null

class TokenService {
  /**
   * Giải mã JWT và trả về payload
   */
  decodeToken(token: string): TokenPayload | null {
    if (!token) return null

    try {
      return jwtDecode<TokenPayload>(token)
    } catch (error) {
      return null
    }
  }

  /**
   * Kiểm tra trạng thái token
   */
  checkTokenStatus(token: string): TokenStatus {
    if (!token) return TokenStatus.INVALID

    const decoded = this.decodeToken(token)
    if (!decoded || !decoded.exp) return TokenStatus.INVALID

    const currentTime = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = decoded.exp - currentTime

    if (timeUntilExpiry <= 0) {
      return TokenStatus.EXPIRED
    }

    if (timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD) {
      return TokenStatus.EXPIRING_SOON
    }

    return TokenStatus.VALID
  }

  /**
   * Lấy thời gian còn lại của phiên làm việc (dựa trên refresh token)
   * @returns thời gian còn lại tính bằng milliseconds
   */
  getSessionRemainingTime(): number {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return 0

    const decoded = this.decodeToken(refreshToken)
    if (!decoded || !decoded.exp) return 0

    const currentTime = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = decoded.exp - currentTime

    return Math.max(0, timeUntilExpiry * 1000) // Chuyển thành milliseconds
  }

  /**
   * Refresh token và trả về access token mới
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('Không có refresh token')
      }
      // Tạo request body theo schema RefreshTokenBody
      const requestBody: RefreshTokenBodyType = {
        refresh: refreshToken
      }
      // Gọi API để refresh token
      const result = await authService.refreshToken(requestBody)

      if (result?.access) {
        // Lưu access token mới vào localStorage
        localStorage.setItem('accessToken', result.access)
        // Phát sự kiện refresh token thành công
        authEvents.emit(AuthEventType.TOKEN_REFRESHED, { accessToken: result.access })
        return result.access
      }

      throw new Error('Không lấy được access token mới')
    } catch (error) {
      // Xóa token khi refresh thất bại
      this.clearTokens()
      // Phát sự kiện phiên làm việc hết hạn
      authEvents.emit(AuthEventType.SESSION_EXPIRED)
      return null
    }
  }

  /**
   * Chủ động refresh token trước khi hết hạn
   */
  async refreshTokenProactively(): Promise<boolean> {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return false

    const tokenStatus = this.checkTokenStatus(accessToken)

    if (tokenStatus === TokenStatus.EXPIRING_SOON || tokenStatus === TokenStatus.EXPIRED) {
      try {
        const newToken = await this.refreshToken()
        return !!newToken
      } catch (error) {
        return false
      }
    }

    return true
  }

  /**
   * Xóa tất cả token khỏi localStorage
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  /**
   * Thiết lập kiểm tra token định kỳ
   */
  startTokenMonitor(): void {
    // Hủy bỏ interval hiện tại nếu có
    this.stopTokenMonitor()
    // Kiểm tra có token trước khi bắt đầu monitor
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!accessToken || !refreshToken) {
      return
    }

    // Kiểm tra tính hợp lệ của refresh token trước khi bắt đầu monitor
    const refreshTokenStatus = this.checkTokenStatus(refreshToken)
    if (refreshTokenStatus === TokenStatus.EXPIRED || refreshTokenStatus === TokenStatus.INVALID) {
      this.clearTokens()
      authEvents.emit(AuthEventType.SESSION_EXPIRED)
      return
    }

    // Biến để ngăn nhiều lần refresh
    let isCurrentlyRefreshing = false

    // Thiết lập kiểm tra định kỳ
    tokenMonitorInterval = window.setInterval(async () => {
      // Nếu đang trong quá trình refresh, bỏ qua
      if (isCurrentlyRefreshing) {
        return
      }

      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        this.stopTokenMonitor()
        return
      }

      const tokenStatus = this.checkTokenStatus(accessToken)

      if (tokenStatus === TokenStatus.EXPIRING_SOON || tokenStatus === TokenStatus.EXPIRED) {
        try {
          isCurrentlyRefreshing = true

          // Thực hiện refresh token
          const success = await this.refreshTokenProactively()

          if (!success) {
            this.clearTokens()
            authEvents.emit(AuthEventType.SESSION_EXPIRED)
          }
        } finally {
          isCurrentlyRefreshing = false
        }
      }
    }, TOKEN_CHECK_INTERVAL) // Tăng lên 10 giây để giảm tần suất kiểm tra
  }

  /**
   * Dừng giám sát token
   */
  stopTokenMonitor(): void {
    if (tokenMonitorInterval !== null) {
      clearInterval(tokenMonitorInterval)
      tokenMonitorInterval = null
    }
  }
}

export const tokenService = new TokenService()
