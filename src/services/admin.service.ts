import api from '@/api/axios'
import {
  AttendanceHistoryResponseSchema,
  AttendanceHistoryResponseType,
  CreateEmployeeFormValues,
  CreateEmployeeResponseSchema,
  CreateEmployeeResponseType,
  EmployeeListResponse,
  EmployeeListResponseType,
  EmployeeSchema,
  EmployeeType,
  UpdateEmployeeFormValues
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

    const res = await api.post('/admin/users/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Xác thực dữ liệu trả về
    const parsed = CreateEmployeeResponseSchema.parse(res.data)
    return parsed
  },

  // Hàm để lấy thông tin chi tiết một nhân viên
  getEmployee: async (id: number): Promise<EmployeeType> => {
    const res = await api.get(`/admin/users/${id}`)
    const parsed = EmployeeSchema.parse(res.data)
    return parsed
  },

  // Hàm để cập nhật thông tin nhân viên
  updateEmployee: async (id: number, data: UpdateEmployeeFormValues): Promise<EmployeeType> => {
    // Tạo FormData để gửi dữ liệu multipart (cho việc upload ảnh)
    const formData = new FormData()

    // Thêm các trường thông tin vào formData
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof UpdateEmployeeFormValues]
      if (value !== undefined && value !== null) {
        if (key === 'employeeImg' && value instanceof File) {
          formData.append(key, value)
        } else if (key === 'password' && value === '') {
          // Không gửi mật khẩu nếu trường để trống
        } else {
          formData.append(key, String(value))
        }
      }
    })

    const res = await api.put(`/admin/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Xác thực dữ liệu trả về
    const parsed = EmployeeSchema.parse(res.data)
    return parsed
  },

  // Hàm để xóa nhân viên
  deleteEmployee: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/admin/users/${id}`)
    return { message: 'Xóa nhân viên thành công' }
  }
}
