import { adminService } from '@/services/admin.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateEmployeeFormValues } from '@/schemas/admin.shema'

export const useAttendanceHistory = () => {
  return useQuery({
    queryKey: ['attendance-history'],
    queryFn: adminService.getHistory,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}

export const useEmployeeList = () => {
  return useQuery({
    queryKey: ['employee-list'],
    queryFn: async () => {
      try {
        const result = await adminService.getEmployeeList()
        return result
      } catch (error) {
        console.error('Lỗi khi gọi API:', error)
        throw error
      }
    }
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeFormValues) => adminService.createEmployee(data),
    onSuccess: () => {
      // Khi tạo nhân viên thành công, cập nhật lại danh sách nhân viên
      queryClient.invalidateQueries({ queryKey: ['employee-list'] })
    }
  })
}
