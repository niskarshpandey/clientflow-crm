import { useEffect, useState } from 'react'
import {
  Plus, Search, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, Users
} from 'lucide-react'

import { leadsApi } from '../../api/leads'
import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

import LeadForm from '../../components/leads/LeadForm'
import LeadTable from '../../components/leads/LeadTable'
import DeleteLeadDialog from '../../components/leads/DeleteLeadDialog'

import {
  LEAD_STATUSES,
  LEAD_PRIORITIES
} from '../../types/lead'

import type {
  Lead,
  LeadInput,
  LeadStatus,
  LeadPriority,
  Pagination
} from '../../types/lead'

export default function Leads() {
  const { token, logout } = useAuth()

  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<LeadStatus | ''>('')
  const [priority, setPriority] = useState<LeadPriority | ''>('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [revision, setRevision] = useState(0)

  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead>()
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!token) return

    let active = true

    const timer = window.setTimeout(async () => {
      if (!active) return

      setLoading(true)
      setError('')

      try {
        const response = await leadsApi.list(token, {
          search: search.trim() || undefined,
          status: status || undefined,
          priority: priority || undefined,
          page,
          limit
        })

        if (!active) return

        if (page > Math.max(1, response.pagination.totalPages)) {
          setPage(Math.max(1, response.pagination.totalPages))
          return
        }

        setLeads(response.data)
        setPagination(response.pagination)
      } catch (err) {
        if (!active) return

        setLeads([])
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load leads'
        )
      } finally {
        if (active) setLoading(false)
      }
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [token, search, status, priority, page, limit, revision])

  useEffect(() => {
    if (!success) return

    const timer = window.setTimeout(() => {
      setSuccess('')
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [success])

  function refresh() {
    setRevision(value => value + 1)
  }

  function openCreate() {
    setEditingLead(undefined)
    setFormOpen(true)
  }

  function openEdit(lead: Lead) {
    setEditingLead(lead)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingLead(undefined)
  }

  async function saveLead(data: LeadInput) {
    if (!token) throw new Error('Please login again')

    try {
      if (editingLead) {
        await leadsApi.update(token, editingLead.id, data)
        setSuccess('Lead updated successfully')
      } else {
        await leadsApi.create(token, data)
        setSuccess('Lead created successfully')
        setPage(1)
      }

      closeForm()
      refresh()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
      }

      throw err
    }
  }

  function openDelete(lead: Lead) {
    setDeleteError('')
    setDeleteTarget(lead)
  }

  async function confirmDelete() {
    if (!token || !deleteTarget || deleting) return

    setDeleting(true)
    setDeleteError('')

    try {
      await leadsApi.remove(token, deleteTarget.id)

      setDeleteTarget(null)
      setSuccess('Lead deleted successfully')
      refresh()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
      }

      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Unable to delete lead'
      )
    } finally {
      setDeleting(false)
    }
  }

  function clearFilters() {
    setSearch('')
    setStatus('')
    setPriority('')
    setPage(1)
    setLoading(true)
    setError('')
    setRevision(value => value + 1)
  }

  const controlClass =
    'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500'

  return (
    <div className="space-y-6">

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Leads Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage your business opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Lead
        </button>
      </header>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Users size={24} />
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Matching Leads
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {loading || error ? '-' : pagination.total}
          </p>
        </div>
      </div>

      {success && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">

        <div className="relative min-w-[200px] flex-1">
          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            aria-label="Search leads"
            placeholder="Search name, email, company..."
            maxLength={100}
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className={`${controlClass} w-full pl-10`}
          />
        </div>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={event => {
            setStatus(event.target.value as LeadStatus | '')
            setPage(1)
          }}
          className={controlClass}
        >
          <option value="">All Statuses</option>

          {LEAD_STATUSES.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by priority"
          value={priority}
          onChange={event => {
            setPriority(event.target.value as LeadPriority | '')
            setPage(1)
          }}
          className={controlClass}
        >
          <option value="">All Priorities</option>

          {LEAD_PRIORITIES.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          Clear Filters
        </button>

        <button
          type="button"
          title="Refresh leads"
          aria-label="Refresh leads"
          onClick={refresh}
          className="rounded-lg border border-slate-300 p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
        </button>
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-20 text-slate-500">
          <Loader2 size={24} className="animate-spin" />
          Loading leads...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p>{error}</p>

          <button
            type="button"
            onClick={refresh}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={logout}
            className="ml-3 text-sm underline"
          >
            Sign in again
          </button>
        </div>
      ) : (
        <>
          <LeadTable
            leads={leads}
            onEdit={openEdit}
            onDelete={openDelete}
          />

          <footer className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">

            <p className="text-sm text-slate-500">
              Showing {
                pagination.total === 0
                  ? 0
                  : (pagination.page - 1) * pagination.limit + 1
              } to {
                Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )
              } of {pagination.total} leads
            </p>

            <div className="flex items-center gap-3">

              <select
                aria-label="Rows per page"
                value={limit}
                onChange={event => {
                  setLimit(Number(event.target.value))
                  setPage(1)
                }}
                className={controlClass}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>

              <button
                type="button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage(value => value - 1)}
                className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm font-medium">
                {page} / {Math.max(1, pagination.totalPages)}
              </span>

              <button
                type="button"
                aria-label="Next page"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(value => value + 1)}
                className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>

            </div>
          </footer>
        </>
      )}

      {formOpen && (
        <LeadForm
          key={editingLead?.id ?? 'new'}
          lead={editingLead}
          onClose={closeForm}
          onSave={saveLead}
        />
      )}

      {deleteTarget && (
        <DeleteLeadDialog
          name={deleteTarget.name}
          deleting={deleting}
          error={deleteError}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
