import { Outlet, useNavigate } from 'react-router-dom'
import { Bell, Search, LogOut } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user?.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'CF'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <header className="flex min-h-20 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">
              Workspace Overview
            </h2>
            <p className="hidden text-xs text-slate-500 sm:block">
              Manage your business in one place
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <Search
              size={20}
              className="hidden cursor-pointer text-slate-500 md:block"
            />

            <Bell
              size={20}
              className="hidden cursor-pointer text-slate-500 md:block"
            />

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {initials}
              </div>

              <div className="hidden max-w-40 sm:block">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={17} />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
