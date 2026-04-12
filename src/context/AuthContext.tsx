import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import toast from 'react-hot-toast'
import { auth, firebaseConfigured, googleProvider, requireAuth } from '../services/firebase'
import { isAdminEmail, isEmailDomainAllowed } from '../services/authHelpers'

type AuthState = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signInWithGoogle: () => Promise<void>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(firebaseConfigured)

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setLoading(false)
      return
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseConfigured || !auth) {
      toast.error('Firebase is not configured.')
      return
    }
    try {
      const cred = await signInWithPopup(requireAuth(), googleProvider)
      const email = cred.user.email
      if (email && !isEmailDomainAllowed(email)) {
        await signOut(requireAuth())
        toast.error('Only approved college or organization email addresses can sign in.')
        return
      }
      toast.success('Signed in successfully')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed'
      toast.error(msg)
    }
  }, [])

  const logOut = useCallback(async () => {
    if (!auth) return
    await signOut(auth)
    toast.success('Signed out')
  }, [])

  const isAdmin = isAdminEmail(user?.email ?? null)

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      signInWithGoogle,
      logOut,
    }),
    [user, loading, isAdmin, signInWithGoogle, logOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
