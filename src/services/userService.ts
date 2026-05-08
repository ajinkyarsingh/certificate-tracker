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
import type { UserProfile, Branch } from '../types/user'


const USERS = 'users'

// ================= CREATE / SYNC =================
export async function ensureUserDocument(user: User): Promise<void> {
  const db = requireDb()
  const ref = doc(db, USERS, user.uid)
  const snap = await getDoc(ref)

  const email = user.email ?? ''
  const googleName =
    user.displayName ?? (email ? email.split('@')[0] : 'User')

  if (!snap.exists()) {
    await setDoc(ref, {
      userId: user.uid,
      email,
      name: googleName,
      usn: '',
      joinYear: new Date().getFullYear(),
      branch: '',
      role: 'student',
      createdAt: serverTimestamp(),
    })
    return
  }

  const data = snap.data()

  const updates: Record<string, unknown> = {}

  if (!data.usn) updates.usn = ''
  if (!data.joinYear) updates.joinYear = new Date().getFullYear()
  if (!data.branch) updates.branch = ''

  if (Object.keys(updates).length > 0) {
    await updateDoc(ref, updates)
  }
}

// ================= SUBSCRIBE =================
export function subscribeUserProfile(
  userId: string,
  onNext: (profile: UserProfile | null) => void,
): Unsubscribe {
  const db = requireDb()

  return onSnapshot(doc(db, USERS, userId), (snap) => {
    if (!snap.exists()) return onNext(null)

    const d = snap.data()

    onNext({
      userId: snap.id,
      email: d.email ?? '',
      name: d.name ?? '',
      usn: d.usn ?? '',
      joinYear: d.joinYear ?? 0,
      branch: d.branch ?? '',
      role: d.role === 'faculty' ? 'faculty' : 'student',
    })
  })
}

// ================= LIST =================
export async function listAllUsers(): Promise<UserProfile[]> {
  const db = requireDb()
  const snap = await getDocs(collection(db, USERS))

  return snap.docs.map((docSnap) => {
    const d = docSnap.data()

    return {
      userId: docSnap.id,
      email: d.email ?? '',
      name: d.name ?? '',
      usn: d.usn ?? '',
      joinYear: d.joinYear ?? 0,
      branch: d.branch ?? '',
      role: d.role === 'faculty' ? 'faculty' : 'student',
    }
  })
}

// ================= UPDATE =================
export async function updateUserProfile(
  userId: string,
  data: {
    name: string
    usn: string
    joinYear: number
    branch: Branch
  },
) {
  const db = requireDb()

  await updateDoc(doc(db, USERS, userId), data)
}
export async function setUserRole(
  userId: string,
  role: 'student' | 'faculty',
): Promise<void> {
  const db = requireDb()
  await updateDoc(doc(db, 'users', userId), { role })
}