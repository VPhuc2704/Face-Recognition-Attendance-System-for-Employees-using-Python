import api from '@/api/axios'
import {
  AttendanceHistoryResponseSchema,
  AttendanceHistoryResponseType,
  EmployeeListResponse,
  EmployeeListResponseType
} from '@/schemas/admin.shema'
import {
  CreateEmployeeFormValues,
  CreateEmployeeResponseSchema,
  CreateEmployeeResponseType
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
  },

  // Thêm hàm mới để tạo nhân viên mới
  createEmployee: async (data: CreateEmployeeFormValues): Promise<CreateEmployeeResponseType> => {
    // Tạo FormData để gửi dữ liệu multipart (cho việc upload ảnh)
    const formData = new FormData()

    // Thêm các trường thông tin vào formData
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof CreateEmployeeFormValues]
      if (value !== undefined && value !== null) {
        if (key === 'employeeImg' && value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      }
    })

    const res = await api.post('/admin/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Xác thực dữ liệu trả về
    const parsed = CreateEmployeeResponseSchema.parse(res.data)
    return parsed
  }
}
