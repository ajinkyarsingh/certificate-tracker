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
    if (!user) return
    if (!file) {
      toast.error('Choose a PDF or image file.')
      return
    }
    const input: AchievementInput = { title, description, date, category }
    if (!input.title.trim()) {
      toast.error('Title is required.')
      return
    }
    setSubmitting(true)
    try {
      await createAchievement(
        user.uid,
        user.email ?? '',
        user.displayName ?? user.email ?? 'Student',
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
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const isImage = file?.type.startsWith('image/')
  const isPdf = file?.type === 'application/pdf' || file?.name.toLowerCase().endsWith('.pdf')

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add achievement</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Upload a certificate (PDF or image) and add details. You can preview images before
        uploading.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            placeholder="e.g. Regional hackathon winner"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            placeholder="What did you achieve?"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as AchievementCategory)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
          >
            {ACHIEVEMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Certificate file
          </span>
          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
            PDF or image (JPEG, PNG, WebP, GIF). Max {Math.round(MAX_CERTIFICATE_BYTES / (1024 * 1024))}{' '}
            MB. Uploaded via Cloudinary.
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            required
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500 dark:text-slate-400"
          />
        </label>
      </div>

      {file && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Preview</p>
          {previewUrl && isImage && (
            <img
              src={previewUrl}
              alt="Certificate preview"
              className="mt-3 max-h-64 w-full rounded-lg object-contain shadow-md"
            />
          )}
          {isPdf && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              PDF selected: <strong>{file.name}</strong> — preview not shown; it will upload as-is.
            </p>
          )}
          {!isImage && !isPdf && file && (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
              Unsupported preview type. Allowed: PDF, JPEG, PNG, WebP, GIF.
            </p>
          )}
        </div>
      )}

      <div className="mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
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
