import { AttendanceStatus, Department, DepartmentValues, PositionValues, Status, StatusValues } from '@/constants/type'
import { z } from 'zod'

export const EmployeeAttendanceSchema = z.object({
  employeeId: z.number(),
  employeeName: z.string(),
  department: z.enum([Department.IT, Department.HR, Department.Accounting, Department.Marketing, Department.Sales])
})

export type EmployeeAttendanceType = z.infer<typeof EmployeeAttendanceSchema>

export const AttendanceHistoryItemSchema = z.object({
  id: z.number(),
  date: z.string(),
  check_in: z.string().nullable(),
  check_out: z.string().nullable(),
  status: z.enum([AttendanceStatus.Present, AttendanceStatus.Absent, AttendanceStatus.Late]),
  created_at: z.string(),
  updated_at: z.string(),
  employee: EmployeeAttendanceSchema
})

export type AttendanceHistoryItemType = z.infer<typeof AttendanceHistoryItemSchema>

export const AttendanceHistoryResponseSchema = z.array(AttendanceHistoryItemSchema)

export type AttendanceHistoryResponseType = z.infer<typeof AttendanceHistoryResponseSchema>

// Thêm schema cho User
export const EmployeeDetailSchema = z.object({
  gender: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  employee_code: z.string().nullable(),
  start_date: z.string().nullable(),
  status: z.enum([Status.Active, Status.Inactive]),
  department: z.string(),
  position: z.string(),
  employeeImg: z.string().nullable()
})

export type EmployeeDetailType = z.infer<typeof EmployeeDetailSchema>

export const EmployeeSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  employee: EmployeeDetailSchema
})

export type EmployeeType = z.infer<typeof EmployeeSchema>

export const EmployeeListResponse = z.array(EmployeeSchema)

export type EmployeeListResponseType = z.infer<typeof EmployeeListResponse>

// Schema cho form tạo nhân viên
export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'Họ không được để trống'),
  lastName: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),

  // Thông tin cá nhân (không bắt buộc)
  gender: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),

  // Thông tin công việc
  department: z.enum(DepartmentValues, {
    errorMap: () => ({ message: 'Vui lòng chọn phòng ban' })
  }),
  position: z.enum(PositionValues, {
    errorMap: () => ({ message: 'Vui lòng chọn vị trí' })
  }),
  employee_code: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  status: z.enum(StatusValues).default(Status.Active).optional(),

  // Ảnh nhân viên
  employeeImg: z.instanceof(File).nullable().optional()
})

export type CreateEmployeeFormValues = z.infer<typeof CreateEmployeeSchema>

// Response schema
export const CreateEmployeeResponseSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  employee: z.object({
    gender: z.string().nullable(),
    date_of_birth: z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    employee_code: z.string().nullable(),
    start_date: z.string().nullable(),
    status: z.enum([Status.Active, Status.Inactive]),
    department: z.string(),
    position: z.string(),
    employeeImg: z.string().nullable()
  })
})

export type CreateEmployeeResponseType = z.infer<typeof CreateEmployeeResponseSchema>
