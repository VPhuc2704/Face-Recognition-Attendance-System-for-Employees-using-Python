import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { AuthContext, AuthContextType } from './AuthContext'
import { LoginResType } from '@/schemas/auth.schema'
import { RoleType } from '@/constants/type'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  //   giúp người dùng không phải đăng nhập lại mỗi khi refresh trang bằng cách lưu trữ thông tin xác thực
  //   trong localStorage và khôi phục nó khi ứng dụng được tải lại.
  useEffect(() => {
    // Load user and tokens from localStorage on mount
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUser = localStorage.getItem('user')

    if (storedAccessToken && storedRefreshToken && storedUser) {
      try {
        setAccessToken(storedAccessToken)
        setRefreshToken(storedRefreshToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }

    setIsLoaded(true)
  }, [])

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
    }
  }

  const clearAuthData = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

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
      {isLoaded ? children : null}
    </AuthContext.Provider>
  )
}
