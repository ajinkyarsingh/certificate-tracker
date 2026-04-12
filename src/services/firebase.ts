import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig: Record<string, string> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

const bucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim()
if (bucket) {
  firebaseConfig.storageBucket = bucket
}

/** Auth + Firestore only (no Firebase Storage). */
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
)

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

if (firebaseConfigured) {
  app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig as FirebaseOptions)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { app, auth, db }
export const googleProvider = new GoogleAuthProvider()

export function requireDb(): Firestore {
  if (!db) throw new Error('Firebase is not configured. Copy .env.example to .env.')
  return db
}

export function requireAuth(): Auth {
  if (!auth) throw new Error('Firebase is not configured. Copy .env.example to .env.')
  return auth
}
