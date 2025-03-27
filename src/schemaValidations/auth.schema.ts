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
export const RegisterBody = z.object({
  username: z
    .string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(20, 'Tên đăng nhập không được vượt quá 20 ký tự')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Tên đăng nhập chỉ chấp nhận chữ cái, số và dấu gạch dưới',
    ),
  email: z.string().email('Email không hợp lệ'),
  department: z.string().min(1, 'Vui lòng chọn phòng ban'),
  position: z.string().min(1, 'Vui lòng nhập vị trí công việc'),
  faceImage: z.instanceof(File).optional(),
})

export type RegisterBodyType = z.infer<typeof RegisterBody>
