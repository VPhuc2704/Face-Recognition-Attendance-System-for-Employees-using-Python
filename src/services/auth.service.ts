import api from '@/api/axios'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
  RegisterResType
} from '@/schemas/auth.schema'

export const authService = {
  login: async (body: LoginBodyType): Promise<LoginResType> => {
    const res = await api.post<LoginResType>('/auth/login', body)
    return res.data
  },

  logout: async (body: LogoutBodyType): Promise<void> => {
    return api.post('/auth/logout', body)
  },

  register: async (formData: FormData): Promise<RegisterResType> => {
    const res = await api.post<RegisterResType>('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data
  },

  refreshToken: async (body: RefreshTokenBodyType): Promise<RefreshTokenResType> => {
    const res = await api.post('/auth/token/refresh', body)
    return res.data
  }
}
