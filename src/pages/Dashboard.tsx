import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CertificateForm } from '../components/CertificateForm'
import { CertificateCard } from '../components/CertificateCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { deleteAchievement, listMyAchievements } from '../services/achievementService'
import type { Achievement } from '../types/achievement'

export function DashboardPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const list = await listMyAchievements(user.uid)
      setItems(list)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load achievements')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  async function onDelete(ach: Achievement) {
    if (!window.confirm(`Delete “${ach.title}”? This cannot be undone.`)) return
    setDeletingId(ach.id)
    try {
      await deleteAchievement(ach)
      toast.success('Deleted')
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your dashboard</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Upload certificates and keep a record of everything you have earned.
        </p>
      </div>

      <CertificateForm onSubmitted={() => void load()} />

      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your certificates</h2>
        {loading ? (
          <LoadingSpinner label="Loading your achievements…" />
        ) : items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            No uploads yet. Add your first achievement above.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {items.map((ach) => (
              <li key={ach.id}>
                <CertificateCard
                  ach={ach}
                  onDelete={onDelete}
                  deleting={deletingId === ach.id}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
