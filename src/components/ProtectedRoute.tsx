import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUserRole } from '../hooks/useUserRole'
import { isAdminEmail } from '../services/authHelpers'
import { LoadingSpinner } from './LoadingSpinner'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const loc = useLocation()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />

  return <>{children}</>
}

/** App super-admins (VITE_ADMIN_EMAILS) — user role management. */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdminEmail(user.email)) return <Navigate to="/" replace />

  return <>{children}</>
}

/** Faculty only — Firestore `users/{uid}.role === 'faculty'`. */
export function FacultyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { loading: roleLoading, role } = useUserRole()

  if (authLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />

  // 🧠 WAIT until role is loaded
  if (roleLoading || role === null) {
    return <LoadingSpinner label="Checking permissions..." />
  }

  if (role !== 'faculty') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
