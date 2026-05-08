export type UserRole = 'student' | 'faculty'

export type Branch =
  | 'CSE'
  | 'CSE(AIML)'
  | 'EEE'
  | 'ECE'
  | 'MECH'
  | 'CIVIL'
  | 'IS'
  | 'ARCH'

export interface UserProfile {
  userId: string
  email: string
  name: string
  usn: string
  joinYear: number
  branch: Branch
  role: UserRole
}