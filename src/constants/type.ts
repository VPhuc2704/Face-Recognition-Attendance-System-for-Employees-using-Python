// export const TokenType = {
//   ForgotPasswordToken: 'ForgotPasswordToken',
//   AccessToken: 'AccessToken',
//   RefreshToken: 'RefreshToken',
//   TableToken: 'TableToken'
// } as const

export const Role = {
  Admin: 'admin',
  Employee: 'staff'
} as const

export type RoleType = (typeof Role)[keyof typeof Role]

export const RoleValues = [Role.Admin, Role.Employee] as const

export interface TokenPayload {
  exp: number
  iat: number
  sub?: string
  // Các trường khác trong JWT payload
}

// Các trạng thái của token
export enum TokenStatus {
  VALID = 'valid', // Token hợp lệ và còn thời hạn
  EXPIRING_SOON = 'expiring', // Token sắp hết hạn
  EXPIRED = 'expired', // Token đã hết hạn
  INVALID = 'invalid' // Token không hợp lệ (sai format, bị sửa đổi)
}

export enum AuthEventType {
  LOGIN_SUCCESS = 'auth:login_success',
  LOGOUT = 'auth:logout',
  TOKEN_REFRESHED = 'auth:token_refreshed',
  SESSION_EXPIRED = 'auth:session_expired',
  AUTH_ERROR = 'auth:error'
}

export interface AuthEventPayload {
  // Các trường dữ liệu tùy chọn cho mỗi loại sự kiện
  [key: string]: any
}

export const Department = {
  IT: 'it',
  HR: 'hr',
  Accounting: 'accounting',
  Marketing: 'marketing',
  Sales: 'sales'
} as const

export type DepartmentType = (typeof Department)[keyof typeof Department]

export const DepartmentValues = [
  Department.IT,
  Department.HR,
  Department.Accounting,
  Department.Marketing,
  Department.Sales
] as const

export const DepartmentLabels: Record<DepartmentType, string> = {
  [Department.IT]: 'Công nghệ thông tin',
  [Department.HR]: 'Nhân sự',
  [Department.Accounting]: 'Kế toán',
  [Department.Marketing]: 'Marketing',
  [Department.Sales]: 'Kinh doanh'
}

export const Position = {
  Staff: 'staff',
  TeamLead: 'team_lead',
  Manager: 'manager',
  Director: 'director',
  Developer: 'developer',
  Designer: 'designer',
  Tester: 'tester',
  Analyst: 'analyst',
  Accountant: 'accountant',
  HRSpecialist: 'hr_specialist',
  MarketingSpecialist: 'marketing_specialist',
  SalesExecutive: 'sales_executive',
  Supervisor: 'supervisor',
  Consultant: 'consultant',
  Intern: 'intern',
  Other: 'other'
} as const

export type PositionType = (typeof Position)[keyof typeof Position]

export const PositionValues = [
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
  Position.Intern,
  Position.Other
] as const

export const PositionLabels: Record<PositionType, string> = {
  [Position.Staff]: 'Nhân viên',
  [Position.TeamLead]: 'Trưởng nhóm',
  [Position.Manager]: 'Quản lý',
  [Position.Director]: 'Giám đốc',
  [Position.Developer]: 'Lập trình viên',
  [Position.Designer]: 'Thiết kế',
  [Position.Tester]: 'Kiểm thử viên',
  [Position.Analyst]: 'Chuyên viên phân tích',
  [Position.Accountant]: 'Kế toán viên',
  [Position.HRSpecialist]: 'Chuyên viên nhân sự',
  [Position.MarketingSpecialist]: 'Chuyên viên marketing',
  [Position.SalesExecutive]: 'Nhân viên kinh doanh',
  [Position.Supervisor]: 'Giám sát',
  [Position.Consultant]: 'Tư vấn viên',
  [Position.Intern]: 'Thực tập sinh',
  [Position.Other]: 'Khác'
}
