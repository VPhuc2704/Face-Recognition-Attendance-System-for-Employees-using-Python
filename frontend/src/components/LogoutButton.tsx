import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { useLogout } from '@/hooks/useAuthentication'
import { useAuth } from '@/contexts/auth'
import { useNavigate } from 'react-router-dom'
import { LogoutBodyType } from '@/schemas/auth.schema'

export function LogoutButton() {
  const { clearAuthData, refreshToken } = useAuth()
  const navigate = useNavigate()
  const logout = useLogout()

  const handleLogout = async () => {
    try {
      const logoutBody: LogoutBodyType = {
        refresh_token: refreshToken || ''
      }
      await logout.mutateAsync(logoutBody)
      clearAuthData()
      navigate('/login')
    } catch (error) {
      clearAuthData()
      navigate('/login')
    }
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleLogout}
      disabled={logout.isPending}
      className='w-full justify-start text-red-500'
    >
      {logout.isPending ? (
        <span className='flex items-center'>
          <Loader2 className='h-4 w-4 animate-spin mr-2' />
          Đang đăng xuất...
        </span>
      ) : (
        <span className='flex items-center'>
          <LogOut className='h-4 w-4 mr-2' />
          Đăng xuất
        </span>
      )}
    </Button>
  )
}
