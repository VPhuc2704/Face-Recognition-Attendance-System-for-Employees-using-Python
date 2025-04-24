import { adminService } from '@/services/admin.service'
import { useQuery } from '@tanstack/react-query'

export const useAttendanceHistory = () => {
  return useQuery({
    queryKey: ['attendance-history'],
    // queryFn: adminService.getHistory,
    queryFn: async () => {
      try {
        // Thêm log để theo dõi việc gọi API
        console.log('Đang gọi API lấy danh sách nhân viên...')
        const result = await adminService.getHistory()
        console.log('API trả về dữ liệu thành công', result.length, 'nhân viên')
        return result
      } catch (error) {
        console.error('Lỗi khi gọi API:', error)
        throw error
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}
