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

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-slate-500">
        This module is coming soon.
      </p>
    </div>
  )
}

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
                element={<PlaceholderPage title="Settings" />}
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
