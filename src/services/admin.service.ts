import api from '@/api/axios'
import { AttendanceHistoryResponseSchema, AttendanceHistoryResponseType } from '@/schemas/admin.shema'

export const adminService = {
  getHistory: async (): Promise<AttendanceHistoryResponseType> => {
    const res = await api.get('/attendance/history')

    // Xác thực dữ liệu trả về
    const parsed = AttendanceHistoryResponseSchema.parse(res.data)
    return parsed
  }
}
