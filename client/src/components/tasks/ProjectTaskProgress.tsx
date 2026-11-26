import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'

import { tasksApi } from '../../api/tasks'
import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

import type { ProjectTaskSummary } from '../../types/task'

interface Props {
  projectId: string
}

export default function ProjectTaskProgress({
  projectId
}: Props) {
  const { token, logout } = useAuth()

  const [summary, setSummary] =
    useState<ProjectTaskSummary | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!token) return

    let active = true

    const timer = window.setTimeout(async () => {
      if (!active) return

      setLoading(true)
      setError('')

      try {
        const response = await tasksApi.getProjectSummary(
          token,
          projectId
        )

        if (active) {
          setSummary(response.data)
        }
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setSummary(null)

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load project progress'
        )
      } finally {
        if (active) setLoading(false)
      }
    }, 0)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [token, projectId, revision, logout])

  function refresh() {
    setLoading(true)
    setRevision(current => current + 1)
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            Project Task Progress
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Calculated from completed tasks
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh project progress"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading progress...
        </div>
      ) : error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : summary ? (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Completion
            </span>

            <span className="text-xl font-bold text-green-600">
              {summary.progress}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Project task completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.progress}
            className="h-3 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, summary.progress))}%`
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Total Tasks',
                value: summary.total,
                color: 'text-slate-900'
              },
              {
                label: 'To Do',
                value: summary.todo,
                color: 'text-slate-600'
              },
              {
                label: 'In Progress',
                value: summary.inProgress,
                color: 'text-blue-600'
              },
              {
                label: 'In Review',
                value: summary.inReview,
                color: 'text-purple-600'
              },
              {
                label: 'Completed',
                value: summary.completed,
                color: 'text-green-600'
              },
              {
                label: 'Cancelled',
                value: summary.cancelled,
                color: 'text-red-600'
              }
            ].map(item => (
              <div
                key={item.label}
                className="rounded-lg bg-slate-50 p-3"
              >
                <p className="text-xs text-slate-500">
                  {item.label}
                </p>

                <p className={`mt-1 text-xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            Cancelled tasks are excluded from completion percentage.
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          No progress information available.
        </p>
      )}
    </section>
  )
}
