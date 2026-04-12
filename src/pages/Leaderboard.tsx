import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { fetchLeaderboard } from '../services/achievementService'

type Row = { userId: string; email: string; displayName: string; count: number }

export function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchLeaderboard(30)
        if (!cancelled) setRows(data)
      } catch (e: unknown) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Failed to load leaderboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Students with the most verified uploads on the platform.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">#</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Student</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Uploads</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                    No stats yet. Be the first to upload an achievement.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={r.userId}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{r.displayName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{r.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                        {r.count}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
