import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { fetchLeaderboard } from '../services/achievementService'

// ✅ UPDATED TYPE
type Row = {
  userId: string
  name: string
  usn: string
  count: number
}

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
        if (!cancelled)
          toast.error(e instanceof Error ? e.message : 'Failed to load leaderboard')
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="mt-1 text-slate-400">
          Students with the most verified uploads on the platform.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">

          <table className="w-full text-left text-sm">

            {/* Header */}
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Uploads</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-slate-400">
                    No stats yet. Be the first to upload an achievement.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={r.userId}
                    className="border-b border-white/5 last:border-0"
                  >
                    {/* Rank */}
                    <td className="px-4 py-3 text-slate-400 font-medium">
                      {i + 1}
                    </td>

                    {/* Name + USN */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">
                        {r.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {r.usn || 'No USN'}
                      </div>
                    </td>

                    {/* Count */}
                    <td className="px-4 py-3">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-purple-600/30 px-2 py-0.5 text-xs font-bold text-purple-300">
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