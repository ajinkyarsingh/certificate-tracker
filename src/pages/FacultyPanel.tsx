import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ACHIEVEMENT_CATEGORIES } from '../constants/categories'
import { deleteAchievement, listAllAchievements } from '../services/achievementService'
import type { Achievement } from '../types/achievement'
import * as XLSX from 'xlsx'

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

  // 🔍 FILTER
  const filtered = useMemo(() => {
    const name = nameFilter.trim().toLowerCase()
    return items.filter((a) => {
      if (
        name &&
        !a.userName.toLowerCase().includes(name) &&
        !(a.userEmail || '').toLowerCase().includes(name)
      ) return false

      if (categoryFilter && a.category !== categoryFilter) return false
      if (dateFrom && a.date < dateFrom) return false
      if (dateTo && a.date > dateTo) return false

      return true
    })
  }, [items, nameFilter, categoryFilter, dateFrom, dateTo])

  // 🔥 SORT BY USN
  function sortByUSN(data: Achievement[]) {
    return [...data].sort((a, b) =>
      (a.userEmail || '').localeCompare(b.userEmail || '')
    )
  }

  // ================= CSV EXPORT =================
  function exportCSV(data: Achievement[]) {
    if (!data.length) return

    const sorted = sortByUSN(data)

    const headers = ['Name', 'USN', 'Title', 'Category', 'Date', 'Uploaded']

    const rows = sorted.map((d) => [
      d.userName,
      d.userEmail,
      d.title,
      d.category,
      d.date,
      formatUploaded(d),
    ])

    const csv =
      [headers, ...rows]
        .map((r) => r.map((v) => `"${v}"`).join(','))
        .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'faculty_achievements.csv'
    a.click()
  }

  // ================= XLSX EXPORT =================
  function exportExcel(data: Achievement[]) {
    if (!data.length) return

    const sorted = sortByUSN(data)

    const sheetData = sorted.map((d, i) => ({
      '#': i + 1,
      Name: d.userName,
      USN: d.userEmail,
      Title: d.title,
      Category: d.category,
      Date: d.date,
      Uploaded: formatUploaded(d),
    }))

    const ws = XLSX.utils.json_to_sheet(sheetData)

    // 🔥 AUTO WIDTH
    ws['!cols'] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Achievements')

    XLSX.writeFile(wb, 'faculty_achievements.xlsx')
  }

  async function onDelete(ach: Achievement) {
    if (!window.confirm(`Delete "${ach.title}" by ${ach.userName}?`)) return
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

      {/* HEADER + BUTTONS */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Faculty Panel</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review all student achievements
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => exportCSV(filtered)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm hover:scale-105 transition"
          >
            Export CSV
          </button>

          <button
            onClick={() => exportExcel(filtered)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm hover:scale-105 transition"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
        <h2 className="text-sm font-semibold text-white">Filters</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <input
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Search name or USN..."
            className="rounded-lg px-3 py-2 bg-black/40 text-white outline-none"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg px-3 py-2 bg-black/40 text-white"
          >
            <option value="">All Categories</option>
            {ACHIEVEMENT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg px-3 py-2 bg-black/40 text-white"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg px-3 py-2 bg-black/40 text-white"
          />
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Showing {filtered.length} of {items.length} entries
        </p>
      </div>

      {/* TABLE */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <table className="w-full text-sm text-left">

            <thead className="border-b border-white/10 text-slate-300">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((ach) => (
                <tr key={ach.id} className="border-b border-white/5">

                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{ach.userName}</p>
                    <p className="text-xs text-slate-400">
                      {ach.userUsn || 'No USN'}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-slate-300">{ach.title}</td>
                  <td className="px-4 py-3 text-slate-400">{ach.category}</td>
                  <td className="px-4 py-3 text-slate-400">{ach.date}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatUploaded(ach)}
                  </td>

                  <td className="px-4 py-3 flex gap-2">
                    <a
                      href={ach.fileUrl}
                      target="_blank"
                      className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600"
                    >
                      View
                    </a>

                    <button
                      disabled={deletingId === ach.id}
                      onClick={() => onDelete(ach)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-600"
                    >
                      {deletingId === ach.id ? '...' : 'Delete'}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  )
}