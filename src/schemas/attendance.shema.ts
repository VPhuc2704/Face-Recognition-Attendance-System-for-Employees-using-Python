import { z } from 'zod'

// Schema cho employee trong response
const EmployeeRecognitionSchema = z.object({
  employeeId: z.number(),
  employee_name: z.string(),
  department: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  employee_code: z.string().nullable().optional()
})

// Schema cho attendance trong response
const AttendanceRecognitionSchema = z.object({
  check_in: z.string(),
  status: z.string()
})

// Schema chung cho response từ API face recognition
export const FaceRecognitionRes = z.object({
  status: z.enum(['success', 'warning', 'error', 'fail']),
  message: z.string(),
  employee: EmployeeRecognitionSchema.optional(),
  attendance: AttendanceRecognitionSchema.optional()
})

export type FaceRecognitionResType = z.infer<typeof FaceRecognitionRes>
