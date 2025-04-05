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
