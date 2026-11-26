import { useEffect, useState } from 'react'

import {
  Plus,
  Search,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FolderKanban
} from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../api/client'
import { projectsApi } from '../../api/projects'

import ProjectForm from '../../components/projects/ProjectForm'
import ProjectTable from '../../components/projects/ProjectTable'
import ProjectDetails from '../../components/projects/ProjectDetails'
import DeleteProjectDialog from '../../components/projects/DeleteProjectDialog'

import type {
  Project,
  ProjectInput,
  ProjectStatus,
  ProjectPriority,
  ProjectPagination
} from '../../types/project'

import {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES
} from '../../types/project'

interface Filters {
  search: string
  status: ProjectStatus | ''
  priority: ProjectPriority | ''
  page: number
  limit: number
}

const initialFilters: Filters = {
  search: '',
  status: '',
  priority: '',
  page: 1,
  limit: 10
}

const initialPagination: ProjectPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0
}

const selectClass =
  'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500'

export default function Projects() {
  const { token, logout } = useAuth()

  const [projects, setProjects] = useState<Project[]>([])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [pagination, setPagination] = useState(initialPagination)
  const [revision, setRevision] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project>()
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!token) return

    let active = true

    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const response = await projectsApi.list(token, {
          search: filters.search.trim() || undefined,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          page: filters.page,
          limit: filters.limit
        })

        if (!active) return

        const lastPage = Math.max(
          1,
          response.pagination.totalPages
        )

        if (filters.page > lastPage) {
          setFilters(previous => ({
            ...previous,
            page: lastPage
          }))
          return
        }

        setProjects(response.data)
        setPagination(response.pagination)
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setProjects([])
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load projects'
        )
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
    setError('')
    setRevision(previous => previous + 1)
  }

  function updateFilters(changes: Partial<Filters>) {
    setLoading(true)

    setFilters(previous => ({
      ...previous,
      ...changes,
      page: changes.page ?? 1
    }))
  }

  function clearFilters() {
    setFilters({ ...initialFilters })
    refresh()
  }

  function openCreate() {
    setEditingProject(undefined)
    setFormOpen(true)
  }

  function openEdit(project: Project) {
    setViewingProject(null)
    setEditingProject(project)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingProject(undefined)
  }

  async function saveProject(data: ProjectInput) {
    if (!token) {
      throw new Error('Please login again')
    }

    try {
      if (editingProject) {
        await projectsApi.update(
          token,
          editingProject.id,
          data
        )

        setSuccess('Project updated successfully')
      } else {
        await projectsApi.create(token, data)

        setFilters({ ...initialFilters })
        setSuccess('Project created successfully')
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

  function openDelete(project: Project) {
    setDeleteTarget(project)
    setDeleteError('')
  }

  function closeDelete() {
    if (deleting) return

    setDeleteTarget(null)
    setDeleteError('')
  }

  async function confirmDelete() {
    if (!token || !deleteTarget || deleting) return

    setDeleting(true)
    setDeleteError('')

    try {
      await projectsApi.remove(token, deleteTarget.id)

      setDeleteTarget(null)
      setSuccess('Project deleted successfully')
      refresh()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }

      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Unable to delete project'
      )
    } finally {
      setDeleting(false)
    }
  }

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
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <FolderKanban size={24} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Projects
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Manage client projects, budgets and deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {success && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-500">
          Matching Projects
        </p>

        <p className="mt-2 text-3xl font-bold text-slate-900">
          {loading || error ? '-' : pagination.total}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Based on your current filters
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">

          <div className="relative min-w-[200px] flex-1">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              aria-label="Search projects"
              value={filters.search}
              maxLength={100}
              onChange={e => updateFilters({
                search: e.target.value
              })}
              placeholder="Search projects or clients..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={e => updateFilters({
              status: e.target.value as ProjectStatus | ''
            })}
            className={selectClass}
          >
            <option value="">All Statuses</option>

            {PROJECT_STATUSES.map(status => (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={filters.priority}
            onChange={e => updateFilters({
              priority: e.target.value as ProjectPriority | ''
            })}
            className={selectClass}
          >
            <option value="">All Priorities</option>

            {PROJECT_PRIORITIES.map(priority => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Clear Filters
          </button>

          <button
            type="button"
            onClick={refresh}
            title="Refresh projects"
            aria-label="Refresh projects"
            className="rounded-lg border border-slate-300 p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw
              size={18}
              className={loading ? 'animate-spin' : ''}
            />
          </button>

        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-3 text-sm font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
          <Loader2 size={22} className="animate-spin" />
          Loading projects...
        </div>
      ) : (
        <>

          <ProjectTable
            projects={projects}
            onView={setViewingProject}
            onEdit={openEdit}
            onDelete={openDelete}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">

            <p className="text-sm text-slate-500">
              Showing {firstRecord} to {lastRecord} of {pagination.total} projects
            </p>

            <div className="flex items-center gap-3">

              <select
                aria-label="Projects per page"
                value={filters.limit}
                onChange={e => updateFilters({
                  limit: Number(e.target.value)
                })}
                className={selectClass}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
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

              <span className="text-sm font-medium text-slate-600">
                {pagination.page} / {Math.max(1, pagination.totalPages)}
              </span>

              <button
                type="button"
                aria-label="Next page"
                disabled={filters.page >= pagination.totalPages}
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

      {formOpen && token && (
        <ProjectForm
          key={editingProject?.id ?? 'new'}
          project={editingProject}
          token={token}
          onClose={closeForm}
          onSave={saveProject}
        />
      )}

      {viewingProject && (
        <ProjectDetails
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          onEdit={openEdit}
        />
      )}

      {deleteTarget && (
        <DeleteProjectDialog
          name={deleteTarget.name}
          deleting={deleting}
          error={deleteError}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
        />
      )}

    </div>
  )
}
