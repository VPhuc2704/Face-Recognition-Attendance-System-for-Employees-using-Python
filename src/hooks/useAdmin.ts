import { adminService } from '@/services/admin.service'
import { useQuery } from '@tanstack/react-query'

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
