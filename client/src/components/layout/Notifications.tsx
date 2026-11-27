
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  X,
  RefreshCw,
  AlertCircle,
  CalendarClock,
  ClipboardList,
  Loader2,
  CheckCircle
} from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { dashboardApi } from '../../api/dashboard'
import { ApiError } from '../../api/client'
import type { DashboardOverview } from '../../types/dashboard'

export default function Notifications() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  function refresh() {
    setLoading(true)
    setError('')
    setRevision(value => value + 1)
  }

  function openModule(path: string) {
    setOpen(false)
    navigate(path)
  }

  useEffect(() => {
    if (!token) return

    let active = true

    dashboardApi.getOverview(token)
      .then(response => {
        if (active) setData(response.data)
      })
      .catch(err => {
        if (!active) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setError('Unable to load notifications.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, revision, logout])

  useEffect(() => {
    if (!open) return

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const overdueTasks = data?.kpis.overdueTasks ?? 0
  const projects = data?.upcoming.projects ?? []
  const tasks = data?.upcoming.tasks ?? []

  const count =
    overdueTasks +
    projects.length +
    tasks.length

  function formatDate(value: string | null) {
    if (!value) return 'No deadline'

    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
        onClick={() => {
          if (!open) refresh()
          setOpen(value => !value)
        }}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
      >
        <Bell size={20} />

        {count > 0 && !error && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <section
            role="dialog"
            aria-label="Workspace notifications"
            className="fixed left-3 right-3 top-20 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Notifications
                </h2>
                <p className="text-xs text-slate-500">
                  Your business reminders
                </p>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Refresh notifications"
                  disabled={loading}
                  onClick={refresh}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={loading ? 'animate-spin' : ''}
                  />
                </button>

                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div role="status" className="flex justify-center gap-2 p-8 text-sm text-slate-500">
                  <Loader2 size={18} className="animate-spin" />
                  Loading notifications...
                </div>
              ) : error ? (
                <div role="alert" className="p-6 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    type="button"
                    onClick={refresh}
                    className="mt-3 text-sm font-medium text-indigo-600"
                  >
                    Try Again
                  </button>
                </div>
              ) : count === 0 ? (
                <div className="flex flex-col items-center gap-2 p-10 text-center">
                  <CheckCircle size={32} className="text-emerald-500" />
                  <p className="font-medium text-slate-800">
                    You're all caught up!
                  </p>
                  <p className="text-sm text-slate-500">
                    No upcoming or overdue reminders.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {overdueTasks > 0 && (
                    <button
                      type="button"
                      onClick={() => openModule('/tasks')}
                      className="flex w-full gap-3 p-4 text-left hover:bg-red-50"
                    >
                      <div className="h-fit rounded-xl bg-red-100 p-2 text-red-600">
                        <AlertCircle size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-red-700">
                          {overdueTasks} overdue {overdueTasks === 1 ? 'task' : 'tasks'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Tasks require your attention.
                        </p>
                      </div>
                    </button>
                  )}

                  {projects.map(project => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => openModule('/projects')}
                      className="flex w-full gap-3 p-4 text-left hover:bg-amber-50"
                    >
                      <div className="h-fit rounded-xl bg-amber-100 p-2 text-amber-600">
                        <CalendarClock size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {project.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Project due: {formatDate(project.dueDate)}
                        </p>
                      </div>
                    </button>
                  ))}

                  {tasks.map(task => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => openModule('/tasks')}
                      className="flex w-full gap-3 p-4 text-left hover:bg-indigo-50"
                    >
                      <div className="h-fit rounded-xl bg-indigo-100 p-2 text-indigo-600">
                        <ClipboardList size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Task due: {formatDate(task.dueDate)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {task.project.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-3 text-center text-xs text-slate-400">
              Upcoming deadlines within 7 days
            </div>
          </section>
        </>
      )}
    </div>
  )
}