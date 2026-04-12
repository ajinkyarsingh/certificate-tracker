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

export async function ensureUserDocument(user: User): Promise<void> {
  const database = requireDb()
  const ref = doc(database, USERS, user.uid)
  const snap = await getDoc(ref)
  const email = user.email ?? ''
  const name = user.displayName ?? (email ? email.split('@')[0] : 'User')

  if (!snap.exists()) {
    await setDoc(ref, {
      userId: user.uid,
      email,
      name,
      role: 'student',
      createdAt: serverTimestamp(),
    })
    return
  }

  const data = snap.data()
  const prevEmail = (data.email as string) ?? ''
  const prevName = (data.name as string) ?? ''
  if (email !== prevEmail || name !== prevName) {
    await updateDoc(ref, { email, name })
  }
}

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
      const role = d.role === 'faculty' ? 'faculty' : 'student'
      onNext({
        userId: snap.id,
        email: (d.email as string) ?? '',
        name: (d.name as string) ?? '',
        role,
      })
    },
    (err) => onError?.(err),
  )
}

export async function listAllUsers(): Promise<UserProfile[]> {
  const database = requireDb()
  const snap = await getDocs(collection(database, USERS))
  const rows: UserProfile[] = []
  snap.forEach((docSnap) => {
    const d = docSnap.data()
    const role = d.role === 'faculty' ? 'faculty' : 'student'
    rows.push({
      userId: docSnap.id,
      email: (d.email as string) ?? '',
      name: (d.name as string) ?? '',
      role,
    })
  })
  rows.sort((a, b) => a.email.localeCompare(b.email))
  return rows
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const database = requireDb()
  await updateDoc(doc(database, USERS, userId), { role })
}
