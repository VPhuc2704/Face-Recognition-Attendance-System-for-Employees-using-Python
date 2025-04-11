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
    const res = await api.post('/auth/login', body)
    const parsed = LoginRes.parse(res.data)
    return parsed
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
