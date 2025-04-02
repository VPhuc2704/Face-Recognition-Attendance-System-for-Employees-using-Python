import { z } from 'zod'

// Định nghĩa schema validation cho form đăng nhập
export const LoginBody = z
  .object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
    password: z
      .string()
      .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  })
  .strict()

export type LoginBodyType = z.infer<typeof LoginBody>

// Schema cho form đăng ký
export const RegisterBody = z
  .object({
    lastName: z
      .string()
      .min(1, 'Họ không được để trống')
      .max(50, 'Họ không được vượt quá 50 ký tự'),
    firstName: z
      .string()
      .min(1, 'Tên đệm và tên không được để trống')
      .max(50, 'Tên đệm và tên không được vượt quá 50 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu không được vượt quá 50 ký tự'),
    confirmPassword: z.string(),
    department: z.string().min(1, 'Vui lòng chọn phòng ban'),
    position: z.string().min(1, 'Vui lòng nhập vị trí công việc'),
    faceImage: z.instanceof(File).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Xác nhận mật khẩu không khớp',
    path: ['confirmPassword'],
  })

export type RegisterBodyType = z.infer<typeof RegisterBody>
