import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, logOut } = useAuth()

  return (
    <header className="w-full border-b border-white/10 bg-white/5 backdrop-blur-xl">
      
      <div className="flex w-full items-center justify-between px-6 py-3">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-sm text-white shadow-md">
            SAT
          </span>
          <span className="hidden sm:inline">Student Achievement Tracker</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user && (
            <>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-8 w-8 rounded-full ring-2 ring-white/20"
                />
              )}

              <button
                onClick={() => void logOut()}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-2 text-sm font-medium text-white hover:scale-105 transition"
              >
                Sign out
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  )
}