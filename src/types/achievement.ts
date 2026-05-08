export type AchievementCategory =
  | 'Sports'
  | 'Technical'
  | 'Cultural'
  | 'Academic'
  | 'Leadership'
  | 'Other'

export interface Achievement {
  id: string
  userId: string
  userEmail: string
  userName: string
  userUsn: string
  userBranch?: string
  userJoinYear?: number
  userYear?: '1st' | '2nd' | '3rd' | '4th' | string
  title: string
  description: string
  date: string
  category: AchievementCategory | string
  /** Cloudinary `secure_url` */
  fileUrl: string
  fileType: 'image' | 'pdf'
  fileName: string
  mimeType: string
  createdAt?: { seconds: number; nanoseconds: number } | Date
}

export interface AchievementInput {
  title: string
  description: string
  date: string
  category: AchievementCategory | string
}

export interface UserStat {
  userId: string
  email: string
  displayName: string
  count: number
}
