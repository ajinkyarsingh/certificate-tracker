import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdminRoute, FacultyRoute, ProtectedRoute } from './components/ProtectedRoute'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { DashboardPage } from './pages/Dashboard'
import { FacultyPanelPage } from './pages/FacultyPanel'
import { LeaderboardPage } from './pages/Leaderboard'
import { LoginPage } from './pages/Login'
import { SetupPage } from './pages/SetupPage'

export function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] text-white">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty"
              element={
                <FacultyRoute>
                  <FacultyPanelPage />
                </FacultyRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Layout>
    </div>
  )
}
