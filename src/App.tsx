import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Booking from '@/pages/Booking'
import Balance from '@/pages/Balance'
import Chat from '@/pages/Chat'
import Profile from '@/pages/Profile'
import News from '@/pages/News'
import BottomNav from '@/components/BottomNav'
import { useAndroidBack } from '@/lib/native'

function AndroidBackHandler() {
  useAndroidBack()
  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  return (
    <BrowserRouter>
      <AndroidBackHandler />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#14141f',
            color: '#fff',
            border: '1px solid rgba(0,245,196,0.2)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            borderRadius: '12px'
          },
          success: { iconTheme: { primary: '#00f5c4', secondary: '#09090f' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#09090f' } }
        }}
      />

      <Routes>
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/balance" element={<ProtectedRoute><Balance /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>

      {isAuthenticated && <BottomNav />}
    </BrowserRouter>
  )
}
