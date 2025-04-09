import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { AuthContext, AuthContextType } from './AuthContext'
import { LoginResType } from '@/schemas/auth.schema'
import { AuthEventType, RoleType } from '@/constants/type'
import { useNavigate } from 'react-router-dom'
import { tokenService } from '@/services/token.service'
import { authEvents } from '@/utils/authEvent'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Sử dụng useRef để tránh vòng lặp vô hạn và ngăn multiple redirects
  const initializedRef = useRef(false)
  const redirectingRef = useRef(false)

  // Khôi phục phiên người dùng từ localStorage khi ứng dụng khởi động
  useEffect(() => {
    if (initializedRef.current) return

    // Function để khởi tạo auth state từ localStorage
    const initializeAuthState = async () => {
      try {
        const storedAccessToken = localStorage.getItem('accessToken')
        const storedRefreshToken = localStorage.getItem('refreshToken')
        const storedUser = localStorage.getItem('user')

        // Đánh dấu đã khởi tạo ngay từ đầu để tránh vòng lặp
        initializedRef.current = true
        let isValid = false

        if (storedAccessToken && storedRefreshToken && storedUser) {
          // Kiểm tra tính hợp lệ của refresh token TRƯỚC KHI khôi phục phiên
          const refreshTokenStatus = tokenService.checkTokenStatus(storedRefreshToken)

          if (refreshTokenStatus === 'expired' || refreshTokenStatus === 'invalid') {
            // Nếu refresh token đã hết hạn, xóa thông tin phiên và không khôi phục
            console.log('Refresh token expired, clearing session data')
            tokenService.clearTokens()
          } else {
            // Khôi phục phiên khi refresh token còn hợp lệ
            const userData = JSON.parse(storedUser)
            setAccessToken(storedAccessToken)
            setRefreshToken(storedRefreshToken)
            setUser(userData)
            isValid = true

            // Chỉ refresh access token khi cần
            const accessTokenStatus = tokenService.checkTokenStatus(storedAccessToken)
            if (accessTokenStatus === 'expired' || accessTokenStatus === 'expiring') {
              tokenService.refreshToken().catch(console.error)
            }
          }
        }
        // Đánh dấu đã tải xong
        setIsLoaded(true)
        // Chuyển hướng nếu không có phiên hợp lệ và không ở trang login/register
        if (!isValid && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          redirectingRef.current = true
          navigate('/login', { replace: true })
        }

        // Bắt đầu giám sát token nếu có phiên hợp lệ
        if (isValid) {
          setTimeout(() => {
            tokenService.startTokenMonitor()
          }, 500)
        }
      } catch (error) {
        setIsLoaded(true)
        initializedRef.current = true
        tokenService.clearTokens()
      }
    }
    // Khởi chạy function
    initializeAuthState()

    // Cleanup khi unmount
    return () => {
      tokenService.stopTokenMonitor()
    }
  }, [])

  useEffect(() => {
    // Handler để chuyển hướng đến trang đăng nhập một cách an toàn (tránh redirect loop)
    const safeRedirectToLogin = () => {
      if (!redirectingRef.current) {
        redirectingRef.current = true
        navigate('/login', { replace: true })
        setTimeout(() => {
          redirectingRef.current = false
        }, 100)
      }
    }

    // Đăng ký lắng nghe các sự kiện xác thực
    const tokenRefreshedCleanup = authEvents.on(AuthEventType.TOKEN_REFRESHED, (data) => {
      if (data?.accessToken) {
        setAccessToken(data.accessToken)
      }
    })

    const sessionExpiredCleanup = authEvents.on(AuthEventType.SESSION_EXPIRED, () => {
      clearAuthData()
      safeRedirectToLogin()
    })

    const logoutCleanup = authEvents.on(AuthEventType.LOGOUT, () => {
      clearAuthData()
      safeRedirectToLogin()
    })

    // Đăng ký lắng nghe sự kiện custom từ tokenService
    const authLogoutHandler = () => {
      clearAuthData()
      safeRedirectToLogin()
    }

    window.addEventListener('auth:logout', authLogoutHandler)

    return () => {
      // Cleanup event listeners khi component unmount
      tokenRefreshedCleanup()
      sessionExpiredCleanup()
      logoutCleanup()
      window.removeEventListener('auth:logout', authLogoutHandler)
    }
  }, [navigate]) // navigate là stable reference từ useNavigate hook
  //   cập nhật và lưu trữ thông tin xác thực của người dùng sau khi đăng nhập thành công
  const setAuthData = (data: LoginResType | null) => {
    if (data) {
      const userData = {
        full_name: data.full_name,
        email: data.email,
        role: data.role
      }
      setUser(userData)
      setAccessToken(data.access_token)
      setRefreshToken(data.refresh_token)

      localStorage.setItem('accessToken', data.access_token)
      localStorage.setItem('refreshToken', data.refresh_token)
      localStorage.setItem('user', JSON.stringify(userData))
      // Bắt đầu giám sát token
      tokenService.startTokenMonitor()

      // Phát sự kiện đăng nhập thành công
      authEvents.emit(AuthEventType.LOGIN_SUCCESS, { user: userData })
    }
  }

  const clearAuthData = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)

    // Xóa khỏi localStorage
    tokenService.clearTokens()

    // Dừng giám sát token
    tokenService.stopTokenMonitor()

    // Clear all queries data from cache
    queryClient.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        hasRole: (role: RoleType) => user?.role === role,
        setAuthData,
        clearAuthData
      }}
    >
      {isLoaded ? (
        children
      ) : (
        <div className='flex items-center justify-center h-screen'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
        </div>
      )}
    </AuthContext.Provider>
  )
}
