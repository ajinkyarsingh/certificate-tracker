/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  /** Optional; not used for uploads (Cloudinary hosts files). */
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  /** Comma-separated admin emails (must match firestore.rules) */
  readonly VITE_ADMIN_EMAILS?: string
  /**
   * Optional. Comma-separated allowed domains, e.g. `university.edu` or `.edu`
   * If empty, any Google account is allowed.
   */
  readonly VITE_ALLOWED_EMAIL_DOMAINS?: string
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
