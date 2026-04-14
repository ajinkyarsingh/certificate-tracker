import { useState } from 'react'
import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { NavLink } from 'react-router-dom'
import { useUserProfile } from '../context/UserProfileContext'
import ProfileSetup from '../pages/ProfileSetup'

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  // ✅ PROFILE HOOK
  const { profile, loading } = useUserProfile()

  // ✅ WAIT FOR PROFILE LOAD
  if (loading) return null

  // ✅ FORCE USER TO ENTER NAME + USN
  if (profile && (!profile.name || !profile.usn)) {
    return <ProfileSetup />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] text-white">

      {/* ================= TOP BAR ================= */}
      <div className="relative">
        
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden absolute left-4 top-3 z-50 p-2 rounded-lg bg-white/10"
        >
          ☰
        </button>

        <Navbar />
      </div>

      <div className="flex">

        {/* ================= MOBILE SIDEBAR ================= */}
        {open && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Sidebar */}
            <aside className="fixed z-50 top-0 left-0 h-full w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-4 md:hidden">
              <h2 className="text-lg font-semibold mb-6 tracking-wide">SAT</h2>

              <nav className="space-y-2 text-sm">
                <NavLink to="/" className="block px-3 py-2 rounded-xl hover:bg-white/10">Dashboard</NavLink>
                <NavLink to="/leaderboard" className="block px-3 py-2 rounded-xl hover:bg-white/10">Leaderboard</NavLink>
                <NavLink to="/faculty" className="block px-3 py-2 rounded-xl hover:bg-white/10">Faculty</NavLink>
                <NavLink to="/admin" className="block px-3 py-2 rounded-xl hover:bg-white/10">Admin</NavLink>
              </nav>

              <button
                onClick={() => setOpen(false)}
                className="mt-6 bg-white/10 rounded-lg px-3 py-2"
              >
                Close
              </button>
            </aside>
          </>
        )}

        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 p-4">
          <h2 className="text-lg font-semibold mb-6 tracking-wide">SAT</h2>

          <nav className="space-y-2 text-sm">
            <NavLink to="/" className="block px-3 py-2 rounded-xl hover:bg-white/10">Dashboard</NavLink>
            <NavLink to="/leaderboard" className="block px-3 py-2 rounded-xl hover:bg-white/10">Leaderboard</NavLink>
            <NavLink to="/faculty" className="block px-3 py-2 rounded-xl hover:bg-white/10">Faculty</NavLink>
            <NavLink to="/admin" className="block px-3 py-2 rounded-xl hover:bg-white/10">Admin</NavLink>
          </nav>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}