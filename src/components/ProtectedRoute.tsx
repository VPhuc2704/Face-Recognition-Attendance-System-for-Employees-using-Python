import { Role, RoleType, TokenStatus } from '@/constants/type'
import { useAuth } from '@/contexts/auth'
import { useRefreshToken } from '@/hooks/useAuthentication'
import { tokenService } from '@/services/token.service'
import { useEffect, useRef } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: RoleType[]
}

export const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, user, setAuthData, clearAuthData } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const refreshTokenMutation = useRefreshToken()
  const isHandlingRefreshRef = useRef(false)

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken')

    // Chỉ xử lý refresh khi không xác thực và có refresh token
    if (!isAuthenticated && refreshToken && !isHandlingRefreshRef.current) {
      // Kiểm tra tính hợp lệ của refresh token trước
      const refreshTokenStatus = tokenService.checkTokenStatus(refreshToken)

      if (refreshTokenStatus === TokenStatus.EXPIRED || refreshTokenStatus === TokenStatus.INVALID) {
        // Token đã hết hạn, xóa và chuyển hướng mà không cần thử refresh
        clearAuthData()
        navigate('/login', { state: { from: location }, replace: true })
        return
      }
      // Đánh dấu đang xử lý để tránh nhiều lần refresh
      isHandlingRefreshRef.current = true

      // Thực hiện refresh token
      refreshTokenMutation
        .mutateAsync()
        .then((result) => {
          if (!result || !result.access) throw new Error('Token refresh failed')

          // Lấy thông tin user đã lưu
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

          // Cập nhật thông tin xác thực
          setAuthData({
            access_token: result.access,
            refresh_token: refreshToken,
            full_name: storedUser.full_name || '',
            email: storedUser.email || '',
            role: storedUser.role || Role.Employee
          })
        })
        .catch(() => {
          clearAuthData()
          navigate('/login', { state: { from: location }, replace: true })
        })
        .finally(() => {
          isHandlingRefreshRef.current = false
        })
    }
  }, [isAuthenticated, location, navigate, clearAuthData, setAuthData, refreshTokenMutation])

  // Hiển thị loading trong quá trình làm mới token
  if (refreshTokenMutation.isPending) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // Check role-based access
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/employee'
    return <Navigate to={redirectPath} replace />
  }

  // Render các route con nếu người dùng có quyền truy cập
  return <>{children}</>
}
