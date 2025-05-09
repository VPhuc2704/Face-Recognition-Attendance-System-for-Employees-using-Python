import { RoleType } from '@/constants/type'
import { LoginResType } from '@/schemas/auth.schema'
import { createContext, useContext } from 'react'

export interface AuthContextType {
  user: {
    full_name: string
    email: string
    role: RoleType
  } | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  hasRole: (role: RoleType) => boolean
  setAuthData: (data: LoginResType | null) => void
  clearAuthData: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
