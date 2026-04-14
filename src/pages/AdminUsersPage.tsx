import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { listAllUsers, setUserRole } from '../services/userService'
import type { UserProfile, UserRole } from '../types/user'

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // 🔄 Load users
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

  // 🔁 Change role
  async function changeRole(userId: string, next: UserRole) {
    setUpdatingId(userId)
    try {
      await setUserRole(userId, next)
      toast.success(
        next === 'faculty'
          ? 'Promoted to faculty'
          : 'Demoted to student'
      )
      await load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* 🔹 HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          User Roles (Admin Panel)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage users and assign faculty roles
        </p>
      </div>

      {/* 🔹 LOADING */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          
          <table className="w-full text-left text-sm">

            {/* 🔹 TABLE HEADER */}
            <thead className="border-b border-white/10 text-slate-300">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            {/* 🔹 TABLE BODY */}
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.userId}
                  className="border-b border-white/5 last:border-0"
                >

                  {/* 👤 NAME + USN */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">
                        {u.name || 'No Name'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {u.usn || 'No USN'}
                      </p>
                    </div>
                  </td>

                  {/* 🎭 ROLE */}
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.role === 'faculty'
                          ? 'px-2 py-1 text-xs rounded-full bg-purple-600/20 text-purple-300'
                          : 'px-2 py-1 text-xs rounded-full bg-gray-600/20 text-gray-300'
                      }
                    >
                      {u.role}
                    </span>
                  </td>

                  {/* ⚙️ ACTION */}
                  <td className="px-4 py-3">
                    {u.role === 'student' ? (
                      <button
                        disabled={updatingId === u.userId}
                        onClick={() => changeRole(u.userId, 'faculty')}
                        className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                      >
                        {updatingId === u.userId ? '...' : 'Promote'}
                      </button>
                    ) : (
                      <button
                        disabled={updatingId === u.userId}
                        onClick={() => changeRole(u.userId, 'student')}
                        className="px-3 py-1.5 text-xs rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                      >
                        {updatingId === u.userId ? '...' : 'Demote'}
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