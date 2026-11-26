import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../api/client'
import { tasksApi } from '../../api/tasks'
import { projectsApi } from '../../api/projects'

import TaskForm from '../../components/tasks/TaskForm'
import TaskTable from '../../components/tasks/TaskTable'
import TaskDetails from '../../components/tasks/TaskDetails'
import DeleteTaskDialog from '../../components/tasks/DeleteTaskDialog'

import type { Project } from '../../types/project'

import type {
  Task,
  TaskInput,
  TaskStatus,
  TaskPriority,
  TaskPagination
} from '../../types/task'

import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS
} from '../../types/task'

interface Filters {
  search: string
  status: TaskStatus | ''
  priority: TaskPriority | ''
  projectId: string
  page: number
  limit: number
}

const initialFilters: Filters = {
  search: '',
  status: '',
  priority: '',
  projectId: '',
  page: 1,
  limit: 10
}

const initialPagination: TaskPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0
}

const inputClass =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500'

export default function Tasks() {
  const { token, logout } = useAuth()

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [projectSearch, setProjectSearch] = useState('')
  const [projectError, setProjectError] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [pagination, setPagination] =
    useState<TaskPagination>(initialPagination)

  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [viewingTask, setViewingTask] = useState<Task | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!token) return

    let active = true

    const timer = window.setTimeout(async () => {
      if (!active) return

      setProjectError('')

      try {
        const response = await projectsApi.list(token, {
          search: projectSearch.trim() || undefined,
          page: 1,
          limit: 100
        })

        if (active) setProjects(response.data)
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setProjectError(
          err instanceof Error
            ? err.message
            : 'Unable to load projects'
        )
      }
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [token, projectSearch, revision, logout])

  useEffect(() => {
    if (!token) return

    let active = true

    const timer = window.setTimeout(async () => {
      if (!active) return

      setLoading(true)
      setError('')

      try {
        const response = await tasksApi.list(token, {
          search: filters.search.trim() || undefined,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          projectId: filters.projectId || undefined,
          page: filters.page,
          limit: filters.limit
        })

        if (!active) return

        const lastPage = Math.max(
          1,
          response.pagination.totalPages
        )

        if (filters.page > lastPage) {
          setFilters(current => ({
            ...current,
            page: lastPage
          }))

          return
        }

        setTasks(response.data)
        setPagination(response.pagination)
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setTasks([])
        setPagination(initialPagination)

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load tasks'
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
    setRevision(current => current + 1)
  }

  function updateFilters(changes: Partial<Filters>) {
    setLoading(true)

    setFilters(current => ({
      ...current,
      ...changes,
      page: changes.page ?? 1
    }))
  }

  function clearFilters() {
    setFilters({ ...initialFilters })
    setProjectSearch('')
    setSelectedProject(null)
    refresh()
  }

  function selectProject(id: string) {
    setSelectedProject(
      projects.find(project => project.id === id) ?? null
    )

    updateFilters({ projectId: id })
  }

  function openCreate() {
    setEditingTask(undefined)
    setFormOpen(true)
  }

  function openEdit(task: Task) {
    setViewingTask(null)
    setEditingTask(task)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingTask(undefined)
  }

  async function saveTask(data: TaskInput) {
    if (!token) throw new Error('Please log in again')

    try {
      if (editingTask) {
        await tasksApi.update(token, editingTask.id, data)
        setSuccess('Task updated successfully')
      } else {
        await tasksApi.create(token, data)
        setSuccess('Task created successfully')
        setFilters({ ...initialFilters })
        setSelectedProject(null)
        setProjectSearch('')
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

  function openDelete(task: Task) {
    setDeleteError('')
    setDeleteTarget(task)
  }

  async function confirmDelete() {
    if (!token || !deleteTarget || deleting) return

    setDeleting(true)
    setDeleteError('')

    try {
      await tasksApi.remove(token, deleteTarget.id)

      setDeleteTarget(null)
      setSuccess('Task deleted successfully')
      refresh()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }

      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Unable to delete task'
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Task Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and track your project tasks
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          New Task
        </button>
      </header>

      <div className="max-w-xs rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Matching Tasks
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading || error ? '-' : pagination.total}
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <ClipboardList size={24} />
          </div>
        </div>
      </div>

      {success && (
        <div role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px] flex-1">
            <Search
              size={17}
              className="absolute left-3 top-2.5 text-slate-400"
            />

            <input
              aria-label="Search tasks"
              value={filters.search}
              maxLength={100}
              onChange={event => updateFilters({
                search: event.target.value
              })}
              placeholder="Search tasks..."
              className={`${inputClass} w-full pl-9`}
            />
          </div>

          <select
            aria-label="Filter by status"
            className={inputClass}
            value={filters.status}
            onChange={event => updateFilters({
              status: event.target.value as TaskStatus | ''
            })}
          >
            <option value="">All Status</option>

            {TASK_STATUSES.map(status => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            className={inputClass}
            value={filters.priority}
            onChange={event => updateFilters({
              priority: event.target.value as TaskPriority | ''
            })}
          >
            <option value="">All Priorities</option>

            {TASK_PRIORITIES.map(priority => (
              <option key={priority} value={priority}>
                {TASK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Clear Filters
          </button>

          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh tasks"
            title="Refresh tasks"
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw
              size={18}
              className={loading ? 'animate-spin' : ''}
            />
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            aria-label="Search projects"
            className={inputClass}
            value={projectSearch}
            maxLength={100}
            onChange={event => setProjectSearch(event.target.value)}
            placeholder="Search projects..."
          />

          <select
            aria-label="Filter by project"
            className={inputClass}
            value={filters.projectId}
            onChange={event => selectProject(event.target.value)}
          >
            <option value="">All Projects</option>

            {selectedProject &&
              !projects.some(item => item.id === selectedProject.id) && (
                <option value={selectedProject.id}>
                  {selectedProject.name}
                </option>
              )}

            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name} - {project.client.name}
              </option>
            ))}
          </select>
        </div>

        {projectError && (
          <p role="alert" className="text-sm text-red-600">
            {projectError}
          </p>
        )}
      </section>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={refresh}
            className="mt-3 text-sm font-medium text-red-700 underline"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-16 text-slate-500">
          <Loader2 size={22} className="animate-spin" />
          Loading tasks...
        </div>
      ) : (
        <>
          <TaskTable
            tasks={tasks}
            onView={setViewingTask}
            onEdit={openEdit}
            onDelete={openDelete}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">
              Showing {pagination.total === 0
                ? 0
                : (pagination.page - 1) * pagination.limit + 1}
              {' - '}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )}
              {' of '}
              {pagination.total} tasks
            </p>

            <div className="flex items-center gap-3">
              <select
                aria-label="Tasks per page"
                value={filters.limit}
                className={inputClass}
                onChange={event => updateFilters({
                  limit: Number(event.target.value)
                })}
              >
                {[10, 20, 50].map(limit => (
                  <option key={limit} value={limit}>
                    {limit} per page
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
        <TaskForm
          task={editingTask}
          token={token}
          onClose={closeForm}
          onSave={saveTask}
        />
      )}

      {viewingTask && (
        <TaskDetails
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={openEdit}
        />
      )}

      {deleteTarget && (
        <DeleteTaskDialog
          title={deleteTarget.title}
          deleting={deleting}
          error={deleteError}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
