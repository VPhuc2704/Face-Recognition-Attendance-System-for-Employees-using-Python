import { authService } from '@/services/auth.service'
import { useMutation } from '@tanstack/react-query'

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login
  })
}

export const useLogout = () => {
  return useMutation({
    mutationFn: authService.logout
  })
}
