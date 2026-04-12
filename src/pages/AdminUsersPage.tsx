import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { listAllUsers, setUserRole } from '../services/userService'
import type { UserProfile, UserRole } from '../types/user'

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listAllUsers()
      setUsers(list)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function changeRole(userId: string, next: UserRole) {
    setUpdatingId(userId)
    try {
      await setUserRole(userId, next)
      toast.success(next === 'faculty' ? 'Promoted to faculty' : 'Role set to student')
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User roles (admin)</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Promote accounts to <strong>faculty</strong> so they can open the Faculty panel. New
          sign-ins default to <strong>student</strong>.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Role</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.role === 'faculty'
                          ? 'rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-200'
                          : 'rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'student' ? (
                      <button
                        type="button"
                        disabled={updatingId === u.userId}
                        onClick={() => void changeRole(u.userId, 'faculty')}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                      >
                        {updatingId === u.userId ? '…' : 'Promote to faculty'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={updatingId === u.userId}
                        onClick={() => void changeRole(u.userId, 'student')}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        {updatingId === u.userId ? '…' : 'Demote to student'}
                      </button>
                    )}
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
