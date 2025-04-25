import { z } from 'zod'

// Schema cho dữ liệu profile từ API
export const ProfileRes = z.object({
  user: z.string(),
  email: z.string().email(),
  gender: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  department: z.object({
    name: z.string(),
    manager: z.string().nullable().optional()
  }),
  position: z.object({
    name: z.string()
  }),
  employee_code: z.string(),
  start_date: z.string().nullable(),
  status: z.string(),
  employeeImg: z.string().nullable()
})

export type ProfileResType = z.infer<typeof ProfileRes>

// Schema cho việc cập nhật profile (chỉ những trường có thể chỉnh sửa)
export const ProfileUpdateBody = z.object({
  phone: z.string().nullable(),
  address: z.string().nullable(),
  gender: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  employeeImg: z.instanceof(File).optional()
})

export type ProfileUpdateBodyType = z.infer<typeof ProfileUpdateBody>

export const ProfileUpdateRes = z.object({
  message: z.string(),
  employee: z.object({
    fullName: z.string(),
    email: z.string().email(),
    gender: z.string().nullable(),
    date_of_birth: z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    department: z.object({
      name: z.string(),
      manager: z.string().nullable().optional()
    }),
    position: z.object({
      name: z.string()
    }),
    employee_code: z.string(),
    start_date: z.string().nullable(),
    status: z.string(),
    employeeImg: z.string().nullable()
  })
})
export type ProfileUpdateResType = z.infer<typeof ProfileUpdateRes>
