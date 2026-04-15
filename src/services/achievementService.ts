import {
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { requireDb } from './firebase'
import {
  getCertificateFileType,
  uploadToCloudinary,
} from './cloudinaryService'
import type { Achievement, AchievementInput } from '../types/achievement'

const ACHIEVEMENTS = 'achievements'
const STATS = 'userStats'

// ================= FILE TYPE =================
function inferFileType(data: Record<string, unknown>): Achievement['fileType'] {
  const ft = data.fileType as string | undefined
  if (ft === 'image' || ft === 'pdf') return ft
  const mime = String(data.mimeType ?? '')
  if (mime.includes('pdf')) return 'pdf'
  return 'image'
}

// ================= MAP DOC =================
function mapDoc(id: string, data: Record<string, unknown>): Achievement {
  return {
    id,
    userId: data.userId as string,
    userEmail: data.userEmail as string,   // ✅ FIXED
    userName: data.userName as string,
    userUsn: data.userUsn as string,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    category: data.category as string,
    fileUrl: data.fileUrl as string,
    fileType: inferFileType(data),
    fileName: data.fileName as string,
    mimeType: data.mimeType as string,
    createdAt: data.createdAt as Achievement['createdAt'],
  }
}

// ================= CREATE =================
export async function createAchievement(
  userId: string,
  userEmail: string,   // ✅ FIXED
  userName: string,
  userUsn: string,
  input: AchievementInput,
  file: File,
): Promise<void> {
  const fileType = getCertificateFileType(file)
  const fileUrl = await uploadToCloudinary(file)

  const database = requireDb()
  const batch = writeBatch(database)

  const achRef = doc(collection(database, ACHIEVEMENTS))

  batch.set(achRef, {
    userId,
    userEmail,   // ✅ FIXED
    userName,
    userUsn,
    title: input.title.trim(),
    description: input.description.trim(),
    date: input.date,
    category: input.category,
    fileUrl,
    fileType,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    createdAt: serverTimestamp(),
  })

  // ================= STATS =================
  const statRef = doc(database, STATS, userId)
  batch.set(
    statRef,
    {
      userId,
      name: userName,
      usn: userUsn,
      email: userEmail, // ✅ IMPORTANT FOR LEADERBOARD
      count: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  await batch.commit()
}

// ================= USER DATA =================
export async function listMyAchievements(userId: string): Promise<Achievement[]> {
  const database = requireDb()
  const q = query(
    collection(database, ACHIEVEMENTS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )

  const snap = await getDocs(q)
  return snap.docs.map((d) => mapDoc(d.id, d.data() as Record<string, unknown>))
}

// ================= ALL DATA =================
export async function listAllAchievements(): Promise<Achievement[]> {
  const database = requireDb()
  const q = query(collection(database, ACHIEVEMENTS), orderBy('createdAt', 'desc'))

  const snap = await getDocs(q)
  return snap.docs.map((d) => mapDoc(d.id, d.data() as Record<string, unknown>))
}

// ================= DELETE =================
export async function deleteAchievement(ach: Achievement): Promise<void> {
  const database = requireDb()
  const batch = writeBatch(database)

  batch.delete(doc(database, ACHIEVEMENTS, ach.id))

  const statRef = doc(database, STATS, ach.userId)
  batch.set(
    statRef,
    {
      count: increment(-1),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  await batch.commit()
}

// ================= LEADERBOARD =================
export async function fetchLeaderboard(limitCount = 50) {
  const database = requireDb()
  const q = query(collection(database, STATS), orderBy('count', 'desc'))

  const snap = await getDocs(q)

  return snap.docs
    .map((d) => {
      const x = d.data()
      return {
        userId: d.id,
        name: (x.name as string) || 'Student',
        usn: (x.usn as string) || '',
        email: (x.email as string) || '', // ✅ FIXED
        count: Number(x.count) || 0,
      }
    })
    .filter((r) => r.count > 0)
    .slice(0, limitCount)
}