import { User } from './user'

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetResponse {
  success: boolean
  message: string
}

export interface UserWithActions extends User {
  actions?: React.ReactNode
}