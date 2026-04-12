import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] text-white">
      
      {/* Top Navbar */}
      <Navbar />

      <div className="flex">
        
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 p-4">
          <h2 className="text-lg font-semibold mb-6 tracking-wide">SAT</h2>

          <nav className="space-y-2 text-sm">
            <a href="/" className="block px-3 py-2 rounded-xl hover:bg-white/10 transition">Dashboard</a>
            <a href="/leaderboard" className="block px-3 py-2 rounded-xl hover:bg-white/10 transition">Leaderboard</a>
            <a href="/faculty" className="block px-3 py-2 rounded-xl hover:bg-white/10 transition">Faculty</a>
            <a href="/admin" className="block px-3 py-2 rounded-xl hover:bg-white/10 transition">Admin</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
