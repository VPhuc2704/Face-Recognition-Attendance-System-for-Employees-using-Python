import { ActionStatus, Department, FaceRecognitionStatus, Position } from '@/constants/type'
import { z } from 'zod'

export const FaceRecognitionReq = z.object({
  image: z.string().min(1, 'Image is required'),
  action: z.enum([ActionStatus.CheckIn, ActionStatus.CheckOut])
})
export type FaceRecognitionReqType = z.infer<typeof FaceRecognitionReq>
// Schema cho employee trong response
const EmployeeRecognitionSchema = z.object({
  employeeId: z.number(),
  employee_name: z.string(),
  department: z.enum([Department.IT, Department.HR, Department.Accounting, Department.Marketing, Department.Sales]),
  position: z.enum([
    Position.Staff,
    Position.TeamLead,
    Position.Manager,
    Position.Director,
    Position.Developer,
    Position.Designer,
    Position.Tester,
    Position.Analyst,
    Position.Accountant,
    Position.HRSpecialist,
    Position.MarketingSpecialist,
    Position.SalesExecutive,
    Position.Supervisor,
    Position.Consultant,
    Position.Intern
  ]),
  employee_code: z.string().nullable().optional()
})

// Schema cho attendance trong response
const AttendanceRecognitionSchema = z.object({
  check_in: z.string().optional().nullable(),
  check_out: z.string().optional().nullable(),
  status: z.string().optional().nullable()
})

// Schema chung cho response từ API face recognition
export const FaceRecognitionRes = z.object({
  status: z.enum([
    FaceRecognitionStatus.Success,
    FaceRecognitionStatus.Fail,
    FaceRecognitionStatus.Error,
    FaceRecognitionStatus.Warning
  ]),
  message: z.string(),
  employee: EmployeeRecognitionSchema.optional(),
  attendance: AttendanceRecognitionSchema.optional()
})

export type FaceRecognitionResType = z.infer<typeof FaceRecognitionRes>
