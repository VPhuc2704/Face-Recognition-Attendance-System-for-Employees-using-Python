import { ProfileUpdateBodyType } from '@/schemas/employee.shema'
import { employeeService } from '@/services/employee.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: employeeService.profile,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ProfileUpdateBodyType) => employeeService.updateProfile(body),
    onSuccess: () => {
      // Invalidate profile query để tải lại dữ liệu mới
      queryClient.invalidateQueries({
        queryKey: ['profile']
      })
    }
  })
}

export const useAttendanceHistory = () => {
  return useQuery({
    queryKey: ['attendance-history'],
    queryFn: employeeService.getHistory,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}
