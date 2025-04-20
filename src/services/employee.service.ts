import api from '@/api/axios'
import {
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
    const res = await api.put('/employees/profile', body)

    // Validate dữ liệu trả về
    const parsed = ProfileUpdateRes.parse(res.data)
    return parsed
  }
}
