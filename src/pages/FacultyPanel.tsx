import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { LoadingSpinner } from '../components/LoadingSpinner'
import {
  listAllAchievements,
  deleteAchievement,
} from '../services/achievementService'
import { getYear } from '../utils/year'

export function FacultyPanel() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [branch, setBranch] = useState('')
  const [year, setYear] = useState('')

  async function load() {
    try {
      setLoading(true)
      const res = await listAllAchievements()
      setData(res)
    } catch {
      toast.error('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function formatUploaded(a: any) {
    const c = a?.createdAt
    if (!c) return ''
    if (c instanceof Date) return c.toLocaleString()
    if (typeof c === 'object' && typeof c.seconds === 'number') {
      return new Date(c.seconds * 1000).toLocaleString()
    }
    return ''
  }

  async function exportCsv() {
    const rows = filtered.map((a, index) => ({
      '#': index + 1,
      Name: a.userName || '',
      USN: a.userUsn || '',
      Title: a.title || '',
      Category: a.category || '',
      'Date of Achievement': a.date || '',
      Uploaded: formatUploaded(a),
    }))

    const header = Object.keys(rows[0] || {})
    const csv = [
      header.join(','),
      ...rows.map((r) =>
        header
          .map((k) => `"${String((r as any)[k] ?? '').replaceAll('"', '""')}"`)
          .join(','),
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'student_achievements_report.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function exportExcel() {
    const header = [
      '#',
      'Name',
      'USN',
      'Title',
      'Category',
      'Date of Achievement',
      'Uploaded',
    ] as const

    const aoa: Array<Array<string | number>> = [
      [...header],
      ...filtered.map((a, index) => [
        index + 1,
        a.userName || '',
        a.userUsn || '',
        a.title || '',
        a.category || '',
        a.date || '',
        formatUploaded(a),
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Achievements')

    XLSX.writeFile(wb, 'student_achievements_report.xlsx', { bookType: 'xlsx' })
  }

  async function handleDelete(a: any) {
    if (!confirm('Delete this achievement?')) return
    try {
      await deleteAchievement(a)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  // ✅ Dynamic categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    data.forEach((a) => a.category && set.add(a.category))
    return Array.from(set)
  }, [data])

  // ✅ FILTER FIXED
  const filtered = useMemo(() => {
    return data.filter((a) => {
      const s = search.toLowerCase()

      const matchSearch =
        a.userName?.toLowerCase().includes(s) ||
        a.userUsn?.toLowerCase().includes(s)

      const matchCategory = category ? a.category === category : true

      const matchBranch = branch
        ? (a.userBranch || '').toLowerCase() === branch.toLowerCase()
        : true

      const matchYear = year
        ? String(a.userYear || '') === year
        : true

      return matchSearch && matchCategory && matchBranch && matchYear
    })
  }, [data, search, category, branch, year])

  return (
    <div className="space-y-6">

      {/* 🔥 HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Faculty Panel</h1>
          <p className="text-slate-400">
            Review all student achievements
          </p>
        </div>

        {/* KEEP YOUR BUTTON STYLE */}
        <div className="flex gap-2">
          <button
            onClick={() => void exportCsv()}
            className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-500 transition-all duration-200"
          >
            Export CSV
          </button>
          <button
            onClick={() => void exportExcel()}
            className="bg-green-600 px-4 py-2 rounded-lg text-white hover:bg-green-500 transition-all duration-200"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* 🔥 FILTER BOX (YOUR ORIGINAL STYLE) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">

        <div className="flex gap-3 flex-wrap items-center">

          <input
            placeholder="Search name or USN..."
            className="bg-slate-800 px-3 py-2 rounded-lg text-white"
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* CATEGORY */}
          <select
            className="bg-slate-800 px-3 py-2 rounded-lg text-white"
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* BRANCH */}
          <select
            className="bg-slate-800 px-3 py-2 rounded-lg text-white"
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">All Branch</option>
            <option>CSE</option>
            <option>CSE(AIML)</option>
            <option>EEE</option>
            <option>ECE</option>
            <option>MECH</option>
            <option>CIVIL</option>
            <option>IS</option>
            <option>ARCH</option>
          </select>

          {/* YEAR */}
          <select
            className="bg-slate-800 px-3 py-2 rounded-lg text-white"
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">All Year</option>
            <option>1st</option>
            <option>2nd</option>
            <option>3rd</option>
            <option>4th</option>
          </select>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Showing {filtered.length} of {data.length} entries
        </p>
      </div>

      {/* 🔥 YOUR ORIGINAL CARD TABLE */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">

          <div className="grid grid-cols-6 px-4 py-3 text-sm text-slate-400 border-b border-slate-800">
            <div>Student</div>
            <div>Title</div>
            <div>Category</div>
            <div>Date</div>
            <div></div>
            <div>Actions</div>
          </div>

          {filtered.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-6 px-4 py-4 items-center border-b border-slate-800"
            >
              <div>
                <div className="text-white font-medium">{a.userName}</div>
                <div className="text-xs text-slate-400">
                  {a.userUsn} • {getYear(a.userJoinYear)} • {a.userBranch}
                </div>
              </div>

              <div>{a.title}</div>
              <div>{a.category}</div>
              <div>{a.date}</div>
              <div></div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(a.fileUrl)}
                  className="bg-indigo-600 px-3 py-1 rounded text-xs text-white hover:bg-indigo-500 transition-all duration-200"
                >
                  View
                </button>

                <button
                  onClick={() => handleDelete(a)}
                  className="bg-red-600 px-3 py-1 rounded text-xs text-white hover:bg-red-500 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}