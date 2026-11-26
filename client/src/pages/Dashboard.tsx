import { useEffect, useState } from 'react'

import {
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react'

import { useAuth } from '../hooks/useAuth'

import { ApiError } from '../api/client'

import { dashboardApi } from '../api/dashboard'

import DashboardKpis from '../components/dashboard/DashboardKpis'

import DashboardCharts from '../components/dashboard/DashboardCharts'

import DashboardRecent from '../components/dashboard/DashboardRecent'

import DashboardDeadlines from '../components/dashboard/DashboardDeadlines'

import type {
  DashboardOverview
} from '../types/dashboard'

export default function Dashboard() {
  const { token, logout } = useAuth()

  const [data, setData] =
    useState<DashboardOverview | null>(null)

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
        const response = await dashboardApi.getOverview(token)

        if (!active) return

        setData(response.data)
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setData(null)

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load dashboard'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }, 0)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [token, revision, logout])

  function refreshDashboard() {
    setLoading(true)
    setError('')
    setRevision(previous => previous + 1)
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor your business performance and operations.
          </p>

          {data && !loading && (
            <p className="mt-2 text-xs text-slate-400">
              Last updated: {
                new Date(data.generatedAt).toLocaleString('en-IN')
              }
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={refreshDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />

          {loading ? 'Refreshing...' : 'Refresh Dashboard'}
        </button>
      </div>

      {loading && (
        <div
          role="status"
          className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8"
        >
          <Loader2
            size={32}
            className="animate-spin text-indigo-600"
          />

          <p className="mt-4 text-sm text-slate-500">
            Loading business analytics...
          </p>
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={22} />

            <h2 className="font-semibold">
              Unable to load dashboard
            </h2>
          </div>

          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={refreshDashboard}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <DashboardKpis kpis={data.kpis} />

          <DashboardCharts
            distributions={data.distributions}
          />

          <DashboardDeadlines
            upcoming={data.upcoming}
          />

          <DashboardRecent
            recent={data.recent}
          />
        </>
      )}

    </div>
  )
}
