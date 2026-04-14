import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { requireDb } from './firebase'
import type { UserProfile, UserRole } from '../types/user'

const USERS = 'users'

// ================= CREATE / SYNC USER =================
export async function ensureUserDocument(user: User): Promise<void> {
  const database = requireDb()
  const ref = doc(database, USERS, user.uid)
  const snap = await getDoc(ref)

  const email = user.email ?? ''
  const googleName =
    user.displayName ?? (email ? email.split('@')[0] : 'User')

  // 🆕 NEW USER
  if (!snap.exists()) {
    await setDoc(ref, {
      userId: user.uid,
      email,
      name: googleName,
      usn: '',
      role: 'student',
      createdAt: serverTimestamp(),
    })
    return
  }

  // 🔁 EXISTING USER
  const data = snap.data()

  const prevEmail = (data.email as string) ?? ''
  const prevName = (data.name as string) ?? ''
  const prevUsn = (data.usn as string) ?? ''

  const updates: Record<string, unknown> = {}

  // ✅ update email only
  if (email !== prevEmail) {
    updates.email = email
  }

  // ❗ DO NOT overwrite name if already exists
  if (!prevName) {
    updates.name = googleName
  }

  // ✅ ensure usn exists
  if (!prevUsn) {
    updates.usn = ''
  }

  if (Object.keys(updates).length > 0) {
    await updateDoc(ref, updates)
  }
}

// ================= SUBSCRIBE =================
export function subscribeUserProfile(
  userId: string,
  onNext: (profile: UserProfile | null) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const database = requireDb()

  return onSnapshot(
    doc(database, USERS, userId),
    (snap) => {
      if (!snap.exists()) {
        onNext(null)
        return
      }

      const d = snap.data()

      const role: UserRole =
        d.role === 'faculty' ? 'faculty' : 'student'

      onNext({
        userId: snap.id,
        email: (d.email as string) ?? '',
        name: (d.name as string) ?? '',
        usn: (d.usn as string) ?? '',
        role,
      })
    },
    (err) => onError?.(err),
  )
}

// ================= LIST USERS =================
export async function listAllUsers(): Promise<UserProfile[]> {
  const database = requireDb()
  const snap = await getDocs(collection(database, USERS))

  const rows: UserProfile[] = []

  snap.forEach((docSnap) => {
    const d = docSnap.data()

    const role: UserRole =
      d.role === 'faculty' ? 'faculty' : 'student'

    rows.push({
      userId: docSnap.id,
      email: (d.email as string) ?? '',
      name: (d.name as string) ?? '',
      usn: (d.usn as string) ?? '',
      role,
    })
  })

  rows.sort((a, b) => a.name.localeCompare(b.name))
  return rows
}

// ================= UPDATE ROLE =================
export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  const database = requireDb()
  await updateDoc(doc(database, USERS, userId), { role })
}

// ================= UPDATE PROFILE (IMPORTANT) =================
export async function updateUserProfile(
  userId: string,
  data: { name: string; usn: string },
): Promise<void> {
  const database = requireDb()

  await updateDoc(doc(database, USERS, userId), {
    name: data.name,
    usn: data.usn,
  })
}