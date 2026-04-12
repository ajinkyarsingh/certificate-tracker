export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-600 dark:border-t-indigo-400"
        aria-hidden
      />
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  )
}
