import { AttendanceStatus, AttendanceStatusType, Department, DepartmentType } from '@/constants/type'
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
