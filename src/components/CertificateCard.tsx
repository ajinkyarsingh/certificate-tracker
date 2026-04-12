import { format } from 'date-fns'
import type { Achievement } from '../types/achievement'

function formatCreated(ach: Achievement) {
  const c = ach.createdAt
  if (!c) return '—'
  if (c instanceof Date) return format(c, 'MMM d, yyyy')
  if (typeof c === 'object' && 'seconds' in c) {
    return format(new Date(c.seconds * 1000), 'MMM d, yyyy')
  }
  return '—'
}

export function CertificateCard({
  ach,
  onDelete,
  showStudent,
  deleting,
}: {
  ach: Achievement
  onDelete?: (a: Achievement) => void
  showStudent?: boolean
  deleting?: boolean
}) {
  const isPdf =
    ach.fileType === 'pdf' ||
    ach.mimeType.includes('pdf') ||
    ach.fileName.toLowerCase().endsWith('.pdf')

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{ach.title}</h3>
            {showStudent && (
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{ach.userName}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
            {ach.category}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{ach.description}</p>
        <dl className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <dt className="font-medium text-slate-700 dark:text-slate-300">Achievement date</dt>
            <dd>{ach.date}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700 dark:text-slate-300">Uploaded</dt>
            <dd>{formatCreated(ach)}</dd>
          </div>
        </dl>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-600 dark:text-slate-300">Cloudinary URL: </span>
          <a
            href={ach.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
            title={ach.fileUrl}
          >
            {ach.fileUrl}
          </a>
        </p>
        <div className="mt-auto flex flex-wrap gap-2">
          <a
            href={ach.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {isPdf ? 'View PDF' : 'View file'}
          </a>
          <a
            href={ach.fileUrl}
            download={ach.fileName}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Download
          </a>
          {onDelete && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => onDelete(ach)}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950"
            >
              {deleting ? 'Removing…' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
