import api from '@/api/axios'
import {
  AttendanceHistoryResponseSchema,
  AttendanceHistoryResponseType,
  EmployeeListResponse,
  EmployeeListResponseType
} from '@/schemas/admin.shema'

export const adminService = {
  getHistory: async (): Promise<AttendanceHistoryResponseType> => {
    const res = await api.get('/attendance/history')

    // Xác thực dữ liệu trả về
    const parsed = AttendanceHistoryResponseSchema.parse(res.data)
    return parsed
  },

  // Thêm hàm mới để lấy danh sách user
  getEmployeeList: async (): Promise<EmployeeListResponseType> => {
    const res = await api.get('/admin/users')
    const parsed = EmployeeListResponse.parse(res.data)
    return parsed
  }
}
