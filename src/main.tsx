import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import { App } from './App'
import { AuthProvider } from './context/AuthContext'
import { UserProfileProvider } from './context/UserProfileContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <UserProfileProvider>
            <App />
          </UserProfileProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white',
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
