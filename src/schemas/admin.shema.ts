import { AttendanceStatus, AttendanceStatusType, Department, DepartmentType, Status } from '@/constants/type'
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
  employeeImg: z.string()
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
