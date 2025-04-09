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

// export interface SessionInfo {
//   isActive: boolean
//   remainingTime: number // milliseconds
//   formattedTime: string // "HH:MM:SS"
//   percentRemaining: number // 0-100
// }
