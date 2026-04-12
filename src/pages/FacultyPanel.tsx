import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ACHIEVEMENT_CATEGORIES } from '../constants/categories'
import { deleteAchievement, listAllAchievements } from '../services/achievementService'
import type { Achievement } from '../types/achievement'

function formatUploaded(ach: Achievement) {
  const c = ach.createdAt
  if (!c) return '—'
  if (c instanceof Date) return c.toLocaleString()
  if (typeof c === 'object' && 'seconds' in c) {
    return new Date(c.seconds * 1000).toLocaleString()
  }
  return '—'
}

export function FacultyPanelPage() {
  const [items, setItems] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listAllAchievements()
      setItems(list)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load achievements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const name = nameFilter.trim().toLowerCase()
    return items.filter((a) => {
      if (
        name &&
        !a.userName.toLowerCase().includes(name) &&
        !a.userEmail.toLowerCase().includes(name)
      ) {
        return false
      }
      if (categoryFilter && a.category !== categoryFilter) return false
      if (dateFrom && a.date < dateFrom) return false
      if (dateTo && a.date > dateTo) return false
      return true
    })
  }, [items, nameFilter, categoryFilter, dateFrom, dateTo])

  async function onDelete(ach: Achievement) {
    if (!window.confirm(`Delete “${ach.title}” by ${ach.userName}?`)) return
    setDeletingId(ach.id)
    try {
      await deleteAchievement(ach)
      toast.success('Entry removed')
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Faculty panel</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Review all student achievements. Sorted by latest upload. Filters apply to the table
          below.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Filters</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Student name or email
            </span>
            <input
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search…"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All</option>
              {ACHIEVEMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Achievement date from
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Achievement date to
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Showing {filtered.length} of {items.length} rows · Newest uploads first
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                  Student
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Title</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                  Category
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                  Achievement date
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                  Uploaded
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No matching achievements.
                  </td>
                </tr>
              ) : (
                filtered.map((ach) => (
                  <tr
                    key={ach.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-slate-900 dark:text-white">{ach.userName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{ach.userEmail}</div>
                    </td>
                    <td className="max-w-[200px] px-4 py-3 align-top text-slate-800 dark:text-slate-200">
                      <span className="line-clamp-2">{ach.title}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-slate-700 dark:text-slate-300">
                      {ach.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-slate-600 dark:text-slate-400">
                      {ach.date}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-slate-500 dark:text-slate-400">
                      {formatUploaded(ach)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={ach.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          disabled={deletingId === ach.id}
                          onClick={() => void onDelete(ach)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
                        >
                          {deletingId === ach.id ? '…' : 'Delete'}
                        </button>
                      </div>
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
