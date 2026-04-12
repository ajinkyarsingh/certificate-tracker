import { useUserProfile } from '../context/UserProfileContext'

/**
 * Role-aware helpers for students vs faculty. Profile is synced from Firestore `users/{uid}`.
 */
export function useUserRole() {
  const { profile, loading, role, isFaculty, refreshProfile } = useUserProfile()

  return {
    profile,
    loading,
    role,
    isFaculty,
    isStudent: role === 'student',
    refreshProfile,
  }
}
