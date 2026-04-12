import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { ensureUserDocument, subscribeUserProfile } from '../services/userService'
import type { UserProfile, UserRole } from '../types/user'

type UserProfileState = {
  profile: UserProfile | null
  loading: boolean
  role: UserRole | null
  isFaculty: boolean
  refreshProfile: () => Promise<void>
}

const UserProfileContext = createContext<UserProfileState | null>(null)

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshProfile = useCallback(async () => {
    if (!user) return
    await ensureUserDocument(user)
  }, [user])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setProfile(null)
    let cancelled = false
    let unsub: (() => void) | undefined

    ;(async () => {
      try {
        await ensureUserDocument(user)
        if (cancelled) return
        unsub = subscribeUserProfile(user.uid, (p) => {
          if (!cancelled) {
            setProfile(p)
            setLoading(false)
          }
        })
      } catch {
        if (!cancelled) {
          setProfile(null)
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
      unsub?.()
    }
  }, [user])

  const role = profile?.role ?? null
  const isFaculty = role === 'faculty'

  const value = useMemo(
    () => ({
      profile,
      loading,
      role,
      isFaculty,
      refreshProfile,
    }),
    [profile, loading, role, isFaculty, refreshProfile],
  )

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext)
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider')
  return ctx
}
