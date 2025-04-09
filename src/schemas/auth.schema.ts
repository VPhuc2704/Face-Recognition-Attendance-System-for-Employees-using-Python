import { Role } from '@/constants/type'
import { z } from 'zod'

// Định nghĩa schema validation cho form đăng nhập
export const LoginBody = z
  .object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  })
  .strict()

export type LoginBodyType = z.infer<typeof LoginBody>

export const LoginRes = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  full_name: z.string(),
  email: z.string(),
  role: z.enum([Role.Admin, Role.Employee])
})
export type LoginResType = z.infer<typeof LoginRes>

// Schema cho form đăng ký
export const RegisterBody = z
  .object({
    lastName: z.string().min(1, 'Họ không được để trống').max(50, 'Họ không được vượt quá 50 ký tự'),
    firstName: z
      .string()
      .min(1, 'Tên đệm và tên không được để trống')
      .max(50, 'Tên đệm và tên không được vượt quá 50 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
    confirmPassword: z.string(),
    department: z.string().min(1, 'Vui lòng chọn phòng ban'),
    position: z.string().min(1, 'Vui lòng nhập vị trí công việc'),
    faceImage: z.instanceof(File).optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Xác nhận mật khẩu không khớp',
    path: ['confirmPassword']
  })

export type RegisterBodyType = z.infer<typeof RegisterBody>

export const RegisterRes = z.object({
  message: z.string(),
  user_info: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    date_joined: z.string(), // Có thể sử dụng z.date() nếu muốn chuyển đổi thành Date
    is_staff: z.boolean(),
    is_superuser: z.boolean(),
    role: z.string() // Hoặc sử dụng z.enum() nếu có danh sách cụ thể các vai trò
  }),
  is_authenticated: z.boolean()
})

export type RegisterResType = z.infer<typeof RegisterRes>

export const LogoutBody = z.object({
  refresh_token: z.string()
})
export type LogoutBodyType = z.infer<typeof LogoutBody>

export const RefreshTokenBody = z.object({
  refresh: z.string()
})
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBody>

export const RefreshTokenRes = z.object({
  access: z.string()
})
export type RefreshTokenResType = z.infer<typeof RefreshTokenRes>
