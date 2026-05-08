import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { listAllAchievements } from '../services/achievementService'

const CATEGORIES = ['Academic', 'Sports', 'Cultural', 'Technical', 'Other'] as const

export function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await listAllAchievements()
        setData(res)
      } catch {
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const stats = useMemo(() => {
    const counts: Record<string, number> = {}
    CATEGORIES.forEach((c) => (counts[c] = 0))
    data.forEach((a) => {
      const c = String(a.category || '')
      if (counts[c] !== undefined) counts[c] += 1
    })
    return {
      total: data.length,
      counts,
    }
  }, [data])

  const selected = useMemo(() => {
    if (!selectedCategory) return []
    return data.filter((a) => String(a.category || '') === selectedCategory)
  }, [data, selectedCategory])

  return (
    <div className="space-y-6">
      {/* Top nav tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className={[
            'px-4 py-2 rounded-xl border border-white/10 backdrop-blur-xl',
            'transition-all duration-200 hover:bg-white/10 hover:scale-[1.02]',
            location.pathname === '/admin' ? 'bg-white/10' : 'bg-white/5',
          ].join(' ')}
        >
          User Roles
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/analytics')}
          className={[
            'px-4 py-2 rounded-xl border border-white/10 backdrop-blur-xl',
            'transition-all duration-200 hover:bg-white/10 hover:scale-[1.02]',
            location.pathname === '/admin/analytics' ? 'bg-white/10' : 'bg-white/5',
          ].join(' ')}
        >
          Analytics
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Achievements overview</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <p className="text-sm text-slate-400">Total achievements</p>
            <p className="mt-1 text-2xl font-semibold text-white">{stats.total}</p>
          </div>

          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4"
            >
              <p className="text-sm text-slate-400">{c}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{stats.counts[c]}</p>
            </button>
          ))}
          </div>

          {selectedCategory && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">{selectedCategory} students</h2>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="px-3 py-1.5 text-xs rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200"
                >
                  Clear
                </button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">USN</th>
                      <th className="px-4 py-3">Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.map((a) => (
                      <tr key={a.id} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-white">{a.userName || ''}</td>
                        <td className="px-4 py-3 text-slate-300">{a.userUsn || ''}</td>
                        <td className="px-4 py-3 text-slate-300">{a.title || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

