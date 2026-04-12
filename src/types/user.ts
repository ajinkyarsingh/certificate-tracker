export type UserRole = 'student' | 'faculty'

export interface UserProfile {
  userId: string
  name: string
  email: string
  role: UserRole
}
