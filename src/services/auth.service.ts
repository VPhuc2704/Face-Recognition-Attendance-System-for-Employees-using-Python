import api from '@/api/axios'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType
} from '@/schemas/auth.schema'

export const authService = {
  login: async (body: LoginBodyType): Promise<LoginResType> => {
    const res = await api.post<LoginResType>('/auth/login', body)
    return res.data
  },
  logout: async (body: LogoutBodyType): Promise<void> => {
    return api.post('/auth/logout', body)
  },
  refreshToken: async (body: RefreshTokenBodyType): Promise<RefreshTokenResType> => {
    const res = await api.post('/auth/token/refresh', body)
    return res.data
  }
}
