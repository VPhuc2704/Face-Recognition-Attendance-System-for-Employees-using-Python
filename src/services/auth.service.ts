import api from '@/api/axios'
import { LoginBodyType, LogoutBodyType, RefreshTokenBodyType } from '@/schemas/auth.schema'
import {
  LoginRes,
  LoginResType,
  RegisterRes,
  RegisterResType,
  RefreshTokenRes,
  RefreshTokenResType
} from '@/schemas/auth.schema'

export const authService = {
  login: async (body: LoginBodyType): Promise<LoginResType> => {
    try {
      const res = await api.post('/auth/login', body)
      const parsed = LoginRes.parse(res.data)
      return parsed
    } catch (error: any) {
      // Định dạng lại lỗi từ API để dễ đọc hơn
      if (error.response) {
        const { status, data } = error.response

        // Dựa vào status để hiển thị thông báo lỗi phù hợp
        if (status === 401) {
          throw new Error('Email hoặc mật khẩu không chính xác')
        }
        if (status === 404) {
          throw new Error('Không tìm thấy tài khoản với email này')
        }
        if (status === 403) {
          throw new Error('Tài khoản đã bị khóa hoặc chưa được kích hoạt')
        }

        // Nếu API trả về message cụ thể, sử dụng message đó
        if (data && data.message) {
          throw new Error(data.message)
        }
      }

      // Nếu không xác định được lỗi cụ thể, ném lỗi ban đầu
      throw error
    }
  },

  logout: async (body: LogoutBodyType): Promise<void> => {
    // Không cần parse vì không nhận response
    await api.post('/auth/logout', body)
  },

  register: async (formData: FormData): Promise<RegisterResType> => {
    const res = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const parsed = RegisterRes.parse(res.data)
    return parsed
  },

  refreshToken: async (body: RefreshTokenBodyType): Promise<RefreshTokenResType> => {
    const res = await api.post('/auth/token/refresh', body)
    const parsed = RefreshTokenRes.parse(res.data)
    return parsed
  }
}
