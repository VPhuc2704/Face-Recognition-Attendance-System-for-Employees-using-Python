import { AuthEventType, Role } from '@/constants/type'
import { useAuth } from '@/contexts/auth'
import { LoginBodyType, RegisterBodyType } from '@/schemas/auth.schema'
import { authService } from '@/services/auth.service'
import { authEvents } from '@/utils/authEvent'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export const useLogin = () => {
  const { setAuthData } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginBodyType & { expectedRole?: string }) => {
      try {
        // Chỉ gửi thông tin đăng nhập cơ bản đến API
        const { email, password } = data
        return authService.login({ email, password })
      } catch (error: any) {
        // Xử lý các mã lỗi cụ thể từ API
        if (error.response) {
          const status = error.response.status
          const responseData = error.response.data
          if (status === 401) {
            throw new Error('Email hoặc mật khẩu không chính xác')
          } else if (status === 404) {
            throw new Error('Không tìm thấy tài khoản với email này')
          } else if (status === 403) {
            throw new Error('Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt')
          } else if (responseData && responseData.message) {
            throw new Error(responseData.message)
          }
        }
        // Lỗi mặc định nếu không xác định được lỗi cụ thể
        throw new Error('Đã có lỗi xảy ra khi đăng nhập')
      }
    },
    onSuccess: (data, variables) => {
      // Kiểm tra vai trò trả về từ API có khớp với vai trò mong đợi hay không
      const { expectedRole } = variables
      if (expectedRole && data.role !== expectedRole) {
        throw new Error(
          `Vai trò không phù hợp. Bạn đang cố đăng nhập vào trang ${expectedRole === Role.Admin ? 'quản trị' : 'nhân viên'}.`
        )
      }
      setAuthData(data)

      navigate(data.role === Role.Admin ? '/admin' : '/employee', { replace: true })
    },
    onError: (error) => {
      console.error('Login error:', error)
      // Có thể hiển thị thông báo lỗi tại đây
      throw error
    }
  })
}

export const useLogout = () => {
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Phát sự kiện đăng xuất
      authEvents.emit(AuthEventType.LOGOUT, {
        reason: 'user_initiated'
      })
    },
    onError: (error) => {
      console.error('Logout error:', error)
      // Vẫn phát sự kiện đăng xuất khi có lỗi
      authEvents.emit(AuthEventType.LOGOUT, {
        reason: 'error',
        error
      })
    }
  })
}

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('Không có refresh token')
      }

      const refreshTokenBody = {
        refresh: refreshToken
      }
      return await authService.refreshToken(refreshTokenBody)
    },
    onSuccess: (data) => {
      if (data.access) {
        authEvents.emit(AuthEventType.TOKEN_REFRESHED, { accessToken: data.access })
      } else {
        authEvents.emit(AuthEventType.SESSION_EXPIRED)
      }
    },
    onError: () => {
      // Khi refresh token thất bại, phát sự kiện session expired
      authEvents.emit(AuthEventType.SESSION_EXPIRED)
    }
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: RegisterBodyType) => {
      // Tạo FormData với cấu trúc API yêu cầu
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('firstName', data.firstName)
      formData.append('lastName', data.lastName)
      formData.append('password', data.password)
      formData.append('password2', data.confirmPassword)
      formData.append('employee[department]', data.department)
      formData.append('employee[position]', data.position)

      if (data.faceImage) {
        formData.append('employee[employeeImg]', data.faceImage)
      }

      return authService.register(formData)
    },
    onSuccess: () => {
      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      navigate('/login', {
        state: {
          registrationSuccess: true,
          message: 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.'
        }
      })
    },
    onError: (error) => {
      console.error('Đăng ký thất bại:', error)
    }
  })
}
