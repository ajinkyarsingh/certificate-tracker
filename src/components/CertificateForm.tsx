import { useUserProfile } from '../context/UserProfileContext'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ACHIEVEMENT_CATEGORIES } from '../constants/categories'
import type { AchievementCategory, AchievementInput } from '../types/achievement'
import { MAX_CERTIFICATE_BYTES, validateCertificateFile } from '../services/cloudinaryService'
import { createAchievement } from '../services/achievementService'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/gif'

export function CertificateForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { user } = useAuth()
  const { profile } = useUserProfile()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState<AchievementCategory>('Academic')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function onFileChange(f: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    if (!f) {
      setFile(null)
      return
    }

    try {
      validateCertificateFile(f)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid file')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFile(null)
      return
    }

    setFile(f)

    if (f.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(f))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!user || !profile) return

    // 🔥 IMPORTANT FIX
    if (!profile.name || !profile.usn) {
      toast.error('Please complete your profile (Name + USN)')
      return
    }

    if (!file) {
      toast.error('Choose a PDF or image file.')
      return
    }

    const input: AchievementInput = {
      title,
      description,
      date,
      category,
    }

    if (!input.title.trim()) {
      toast.error('Title is required.')
      return
    }

    setSubmitting(true)

    try {
      await createAchievement(
        profile.userId,
        profile.name, // ✅ YOUR NAME
        profile.usn,  // ✅ YOUR USN
        input,
        file,
      )

      toast.success('Achievement saved')

      setTitle('')
      setDescription('')
      setDate(new Date().toISOString().slice(0, 10))
      setCategory('Academic')
      onFileChange(null)

      if (fileInputRef.current) fileInputRef.current.value = ''

      onSubmitted()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  const isImage = file?.type.startsWith('image/')
  const isPdf =
    file?.type === 'application/pdf' ||
    file?.name.toLowerCase().endsWith('.pdf')

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
    >
      <h2 className="text-lg font-semibold text-white">Add achievement</h2>

      <p className="mt-1 text-sm text-slate-400">
        Upload a certificate (PDF or image) and add details. You can preview images before uploading.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        {/* Title */}
        <label className="block sm:col-span-2">
          <span className="text-sm">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2"
            placeholder="e.g. Regional hackathon winner"
          />
        </label>

        {/* Description */}
        <label className="block sm:col-span-2">
          <span className="text-sm">Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2"
            placeholder="What did you achieve?"
          />
        </label>

        {/* Date */}
        <label className="block">
          <span className="text-sm">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2"
          />
        </label>

        {/* Category */}
        <label className="block">
          <span className="text-sm">Category</span>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as AchievementCategory)
            }
            className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2"
          >
            {ACHIEVEMENT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        {/* File */}
        <label className="block sm:col-span-2">
          <span className="text-sm">Certificate file</span>

          <span className="block text-xs text-slate-400 mt-1">
            PDF or image (JPEG, PNG, WebP, GIF). Max {Math.round(MAX_CERTIFICATE_BYTES / (1024 * 1024))} MB.
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm text-slate-400 
            file:mr-3 
            file:rounded-lg 
            file:border-0 
            file:bg-gradient-to-r 
            file:from-purple-500 
            file:to-indigo-600 
            file:px-4 
            file:py-2 
            file:text-sm 
            file:font-medium 
            file:text-white 
            hover:file:scale-105 
            file:transition"
          />
        </label>
      </div>

      {/* Preview */}
      {file && (
        <div className="mt-6">
          {previewUrl && isImage && (
            <img src={previewUrl} className="rounded-xl max-h-64" />
          )}
          {isPdf && (
            <p className="text-sm text-slate-400 mt-2">
              PDF selected: {file.name}
            </p>
          )}
        </div>
      )}

      {/* BUTTON */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
        >
          {submitting ? 'Uploading…' : 'Save achievement'}
        </button>
      </div>

      {submitting && (
        <div className="mt-4">
          <LoadingSpinner label="Uploading certificate…" />
        </div>
      )}
    </form>
  )
}