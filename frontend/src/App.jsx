import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SelectBuilding from './pages/SelectBuilding'
import useAuth from './hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

const PendingRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.building_id && user.building_id !== 'pending') return <Navigate to="/dashboard" replace />
  return children
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/select-building" element={
          <PendingRoute>
            <SelectBuilding />
          </PendingRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App