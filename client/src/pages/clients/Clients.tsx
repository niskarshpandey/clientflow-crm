import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react'

import { clientsApi } from '../../api/clients'
import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

import ClientForm from '../../components/clients/ClientForm'
import ClientTable from '../../components/clients/ClientTable'
import ClientProfile from '../../components/clients/ClientProfile'
import DeleteClientDialog from '../../components/clients/DeleteClientDialog'

import { CLIENT_STATUSES } from '../../types/client'

import type {
  Client,
  ClientInput,
  ClientStatus,
  ClientPagination
} from '../../types/client'

interface Filters {
  search: string
  status: ClientStatus | ''
  page: number
  limit: number
}

const initialFilters: Filters = {
  search: '',
  status: '',
  page: 1,
  limit: 10
}

export default function Clients() {
  const { token, logout } = useAuth()

  const [clients, setClients] = useState<Client[]>([])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [revision, setRevision] = useState(0)

  const [pagination, setPagination] = useState<ClientPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client>()
  const [viewingClient, setViewingClient] = useState<Client | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)
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
        const response = await clientsApi.list(token, {
          search: filters.search.trim() || undefined,
          status: filters.status || undefined,
          page: filters.page,
          limit: filters.limit
        })

        if (!active) return

        const lastPage = Math.max(1, response.pagination.totalPages)

        if (filters.page > lastPage) {
          setFilters(previous => ({
            ...previous,
            page: lastPage
          }))
          return
        }

        setClients(response.data)
        setPagination(response.pagination)
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setClients([])
        setError(err instanceof Error ? err.message : 'Unable to load clients')
      } finally {
        if (active) setLoading(false)
      }
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [token, filters, revision, logout])

  useEffect(() => {
    if (!success) return

    const timer = window.setTimeout(() => {
      setSuccess('')
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [success])

  function refresh() {
    setLoading(true)
    setRevision(previous => previous + 1)
  }

  function updateFilters(changes: Partial<Filters>) {
    setLoading(true)
    setFilters(previous => ({
      ...previous,
      ...changes
    }))
  }

  function clearFilters() {
    setFilters({ ...initialFilters })
    setError('')
    refresh()
  }

  function openCreate() {
    setEditingClient(undefined)
    setFormOpen(true)
  }

  function openEdit(client: Client) {
    setViewingClient(null)
    setEditingClient(client)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingClient(undefined)
  }

  async function saveClient(data: ClientInput) {
    if (!token) throw new Error('Please login again')

    try {
      if (editingClient) {
        await clientsApi.update(token, editingClient.id, data)
        setSuccess('Client updated successfully')
      } else {
        await clientsApi.create(token, data)
        setSuccess('Client created successfully')

        setFilters({ ...initialFilters })
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

  function openDelete(client: Client) {
    setDeleteError('')
    setDeleteTarget(client)
  }

  async function confirmDelete() {
    if (!token || !deleteTarget || deleting) return

    setDeleting(true)
    setDeleteError('')

    try {
      await clientsApi.remove(token, deleteTarget.id)

      setDeleteTarget(null)
      setSuccess('Client deleted successfully')
      refresh()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
      }

      setDeleteError(
        err instanceof Error ? err.message : 'Unable to delete client'
      )
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.max(1, pagination.totalPages)

  const firstRecord = pagination.total === 0
    ? 0
    : (pagination.page - 1) * pagination.limit + 1

  const lastRecord = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  )

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Clients
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your customers and business relationships.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Users size={24} />
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Matching Clients
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {loading || error ? '-' : pagination.total}
          </p>
        </div>
      </div>

      {success && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-5">

          <div className="relative min-w-[200px] flex-1">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              aria-label="Search clients"
              value={filters.search}
              maxLength={100}
              onChange={e => updateFilters({
                search: e.target.value,
                page: 1
              })}
              placeholder="Search name, email, company..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            aria-label="Filter by client status"
            value={filters.status}
            onChange={e => updateFilters({
              status: e.target.value as ClientStatus | '',
              page: 1
            })}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            <option value="">All Statuses</option>

            {CLIENT_STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Clear Filters
          </button>

          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh clients"
            title="Refresh clients"
            className="rounded-lg border border-slate-300 p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
            <Loader2 size={28} className="animate-spin text-blue-600" />
            <p className="text-sm">Loading clients...</p>
          </div>
        ) : error ? (
          <div className="space-y-4 p-10 text-center">
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={refresh}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <ClientTable
              clients={clients}
              onView={setViewingClient}
              onEdit={openEdit}
              onDelete={openDelete}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 p-5">

              <p className="text-sm text-slate-500">
                Showing {firstRecord}-{lastRecord} of {pagination.total} clients
              </p>

              <div className="flex flex-wrap items-center gap-3">

                <select
                  aria-label="Clients per page"
                  value={filters.limit}
                  onChange={e => updateFilters({
                    limit: Number(e.target.value),
                    page: 1
                  })}
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                >
                  {[10, 20, 50].map(limit => (
                    <option key={limit} value={limit}>
                      {limit} / page
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={filters.page <= 1}
                  onClick={() => updateFilters({
                    page: filters.page - 1
                  })}
                  className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-sm text-slate-600">
                  Page {pagination.page} of {totalPages}
                </span>

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={filters.page >= totalPages}
                  onClick={() => updateFilters({
                    page: filters.page + 1
                  })}
                  className="rounded-lg border border-slate-300 p-2 disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>

              </div>
            </div>
          </>
        )}
      </section>

      {formOpen && (
        <ClientForm
          key={editingClient?.id ?? 'new'}
          client={editingClient}
          onClose={closeForm}
          onSave={saveClient}
        />
      )}

      {viewingClient && (
        <ClientProfile
          client={viewingClient}
          onClose={() => setViewingClient(null)}
          onEdit={openEdit}
        />
      )}

      {deleteTarget && (
        <DeleteClientDialog
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
