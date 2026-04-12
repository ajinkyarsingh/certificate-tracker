/** Max upload size for certificates (5 MB). */
export const MAX_CERTIFICATE_BYTES = 5 * 1024 * 1024

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

function isAllowedType(file: File): boolean {
  const t = file.type.toLowerCase()
  if (ALLOWED_MIME.has(t)) return true
  if (!t && file.name.toLowerCase().endsWith('.pdf')) return true
  return false
}

/** Throws if file is not an allowed image/PDF or exceeds size limit. */
export function validateCertificateFile(file: File): void {
  if (file.size > MAX_CERTIFICATE_BYTES) {
    throw new Error('File must be 5 MB or smaller.')
  }
  if (!isAllowedType(file)) {
    throw new Error('Only PDF and image files (JPEG, PNG, WebP, GIF) are allowed.')
  }
}

export type CertificateFileType = 'image' | 'pdf'

export function getCertificateFileType(file: File): CertificateFileType {
  validateCertificateFile(file)
  const name = file.name.toLowerCase()
  const t = file.type.toLowerCase()
  if (t === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (t.startsWith('image/')) return 'image'
  throw new Error('Only PDF and image files are allowed.')
}

export function isCloudinaryConfigured(): boolean {
  const name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim()
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim()
  return Boolean(name && preset)
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  validateCertificateFile(file)

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim()
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim()
  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.',
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = (await res.json()) as { secure_url?: string; error?: { message?: string } }

  if (!res.ok) {
    const msg = data.error?.message ?? res.statusText ?? 'Upload failed'
    throw new Error(msg)
  }

  if (!data.secure_url) {
    throw new Error('Upload did not return a file URL.')
  }

  return data.secure_url
}
