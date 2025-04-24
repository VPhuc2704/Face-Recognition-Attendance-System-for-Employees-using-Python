import { adminService } from '@/services/admin.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateEmployeeFormValues, UpdateEmployeeFormValues } from '@/schemas/admin.shema'

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

// Hook để lấy thông tin chi tiết của một nhân viên
export const useGetEmployee = (id: number) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => adminService.getEmployee(id),
    enabled: !!id, // Chỉ thực hiện khi có id
    refetchOnWindowFocus: false
  })
}

// Hook để cập nhật thông tin nhân viên
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeFormValues }) => adminService.updateEmployee(id, data),
    onSuccess: (_, variables) => {
      // Khi cập nhật thành công, làm mới cache của nhân viên đã cập nhật
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
      // Cập nhật luôn danh sách nhân viên
      queryClient.invalidateQueries({ queryKey: ['employee-list'] })
    }
  })
}
