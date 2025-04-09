import { AuthEventType, Role } from '@/constants/type'
import { useAuth } from '@/contexts/auth'
import { authService } from '@/services/auth.service'
import { authEvents } from '@/utils/authEvent'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export const useLogin = () => {
  const { setAuthData } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Cập nhật auth context
      setAuthData(data)

      navigate(data.role === Role.Admin ? '/admin' : '/employee', { replace: true })
    },
    onError: (error) => {
      console.error('Login error:', error)
      // Có thể hiển thị thông báo lỗi tại đây
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
