import api from '@/api/axios'
import {
  AttendanceHistoryResponse,
  AttendanceHistoryResponseType,
  ProfileRes,
  ProfileResType,
  ProfileUpdateBodyType,
  ProfileUpdateRes,
  ProfileUpdateResType
} from '@/schemas/employee.shema'

export const employeeService = {
  profile: async (): Promise<ProfileResType> => {
    const res = await api.get('/employees/profile')

    // Validate dữ liệu trả về
    const parsed = ProfileRes.parse(res.data)

    return parsed
  },

  updateProfile: async (body: ProfileUpdateBodyType): Promise<ProfileUpdateResType> => {
    const formData = new FormData()

    // Thêm các trường dữ liệu thông thường
    if (body.phone !== null) formData.append('phone', body.phone)
    if (body.address !== null) formData.append('address', body.address)
    if (body.gender !== null) formData.append('gender', body.gender)
    if (body.date_of_birth !== null) formData.append('date_of_birth', body.date_of_birth)

    // Thêm file hình ảnh nếu có
    if (body.employeeImg) formData.append('employeeImg', body.employeeImg)

    const res = await api.put('/employees/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Validate dữ liệu trả về
    const parsed = ProfileUpdateRes.parse(res.data)
    return parsed
  },

  getHistory: async (): Promise<AttendanceHistoryResponseType> => {
    const res = await api.get('/attendance/history')

    // Xác thực dữ liệu trả về
    const parsed = AttendanceHistoryResponse.parse(res.data)
    return parsed
  }
}
