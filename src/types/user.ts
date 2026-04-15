export type UserRole = 'student' | 'faculty'

export interface UserProfile {
  userId: string
  email: string
  name: string
  usn: string // ✅ ADD THIS
  role: UserRole
}
