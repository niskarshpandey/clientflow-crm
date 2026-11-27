import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  Loader2,
  ChevronRight
} from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { leadsApi } from '../../api/leads'
import { clientsApi } from '../../api/clients'
import { projectsApi } from '../../api/projects'
import { tasksApi } from '../../api/tasks'
import { ApiError } from '../../api/client'

type SearchResult = {
  id: string
  title: string
  subtitle: string
  category: string
  path: string
}

export default function GlobalSearch() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function closeSearch() {
    setOpen(false)
    setQuery('')
    setResults([])
    setError('')
    setLoading(false)
  }

  useEffect(() => {
    if (!open) return

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
        setResults([])
        setError('')
        setLoading(false)
      }
    }

    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('keydown', handleKey)
    }
  }, [open])

  useEffect(() => {
    const search = query.trim()

    if (!open || !token || search.length < 2) return

    let active = true

    const timer = window.setTimeout(async () => {
      try {
        const filters = {
          search,
          page: 1,
          limit: 5
        }

        const [leads, clients, projects, tasks] =
          await Promise.all([
            leadsApi.list(token, filters),
            clientsApi.list(token, filters),
            projectsApi.list(token, filters),
            tasksApi.list(token, filters)
          ])

        if (!active) return

        setResults([
          ...leads.data.map(item => ({
            id: item.id,
            title: item.name,
            subtitle: item.status,
            category: 'Leads',
            path: '/leads'
          })),

          ...clients.data.map(item => ({
            id: item.id,
            title: item.name,
            subtitle: item.status,
            category: 'Clients',
            path: '/clients'
          })),

          ...projects.data.map(item => ({
            id: item.id,
            title: item.name,
            subtitle: item.status,
            category: 'Projects',
            path: '/projects'
          })),

          ...tasks.data.map(item => ({
            id: item.id,
            title: item.title,
            subtitle: item.status,
            category: 'Tasks',
            path: '/tasks'
          }))
        ])
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setError('Unable to search. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }, 350)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [open, query, token, logout])

  return (
    <>
      <button
        type="button"
        aria-label="Global search"
        title="Global search"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
      >
        <Search size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-24"
          onClick={closeSearch}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 p-4">
              <Search size={22} className="text-slate-400" />

              <input
                autoFocus
                aria-label="Search workspace"
                placeholder="Search leads, clients, projects, tasks..."
                value={query}
                maxLength={100}
                onChange={event => {
                  const value = event.target.value
                  setQuery(value)
                  setResults([])
                  setError('')
                  setLoading(value.trim().length >= 2)
                }}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />

              <button
                type="button"
                aria-label="Close search"
                onClick={closeSearch}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {query.trim().length < 2 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  Enter at least 2 characters to search.
                </p>
              )}

              {loading && (
                <div role="status" className="flex justify-center gap-2 py-8 text-sm text-slate-500">
                  <Loader2 size={18} className="animate-spin" />
                  Searching...
                </div>
              )}

              {error && (
                <p role="alert" className="p-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              {!loading && !error &&
                query.trim().length >= 2 &&
                results.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No matching records found.
                  </p>
              )}

              {!loading && !error &&
                ['Leads', 'Clients', 'Projects', 'Tasks'].map(category => {
                  const items = results.filter(
                    item => item.category === category
                  )

                  if (!items.length) return null

                  return (
                    <div key={category} className="mb-4">
                      <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {category}
                      </h3>

                      {items.map(item => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => {
                            navigate(item.path)
                            closeSearch()
                          }}
                          className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-indigo-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.subtitle.replaceAll('_', ' ')}
                            </p>
                          </div>

                          <ChevronRight size={17} className="shrink-0 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )
                })}
            </div>

            <div className="border-t border-slate-200 p-3 text-xs text-slate-400">
              Press Esc to close
            </div>
          </section>
        </div>
      )}
    </>
  )
}