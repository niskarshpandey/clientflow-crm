import Settings from './pages/Settings'
import Tasks from './pages/tasks/Tasks'
import Projects from './pages/projects/Projects'
import Clients from './pages/clients/Clients'
import Leads from './pages/leads/Leads'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './context/AuthProvider'



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route
                index
                element={<Navigate to="/dashboard" replace />}
              />

              <Route path="dashboard" element={<Dashboard />} />

              <Route
                path="leads"
                element={<Leads />}
              />

              <Route
                path="clients"
                element={<Clients />}
              />

              <Route
                path="projects"
                element={<Projects />}
              />
              <Route
                path="tasks"
                element={<Tasks />}
              />

              <Route
                path="settings"
                element={<Settings />}
              />
            </Route>
          </Route>

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
