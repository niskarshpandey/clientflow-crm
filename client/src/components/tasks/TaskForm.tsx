import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'

import { projectsApi } from '../../api/projects'

import type { Project } from '../../types/project'

import type {
  Task,
  TaskInput,
  TaskProject,
  TaskStatus,
  TaskPriority
} from '../../types/task'

import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS
} from '../../types/task'

interface Props {
  task?: Task
  token: string
  onClose: () => void
  onSave: (data: TaskInput) => Promise<void>
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

const labelClass =
  'mb-1 block text-sm font-medium text-slate-700'

export default function TaskForm({
  task,
  token,
  onClose,
  onSave
}: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [projectId, setProjectId] = useState(task?.projectId ?? '')

  const [status, setStatus] = useState<TaskStatus>(
    task?.status ?? 'TO_DO'
  )

  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? 'MEDIUM'
  )

  const [startDate, setStartDate] = useState(
    task?.startDate?.slice(0, 10) ?? ''
  )

  const [dueDate, setDueDate] = useState(
    task?.dueDate?.slice(0, 10) ?? ''
  )

  const [estimatedHours, setEstimatedHours] = useState(
    task?.estimatedHours ?? ''
  )

  const [actualHours, setActualHours] = useState(
    task?.actualHours ?? ''
  )

  const [projects, setProjects] = useState<Project[]>([])

  const [selectedProject, setSelectedProject] =
    useState<TaskProject | null>(task?.project ?? null)

  const [projectSearch, setProjectSearch] = useState('')
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectError, setProjectError] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const timer = window.setTimeout(async () => {
      if (!active) return

      setProjectsLoading(true)
      setProjectError('')

      try {
        const response = await projectsApi.list(token, {
          search: projectSearch.trim() || undefined,
          page: 1,
          limit: 100
        })

        if (active) {
          setProjects(response.data)
        }
      } catch (err) {
        if (active) {
          setProjects([])
          setProjectError(
            err instanceof Error
              ? err.message
              : 'Unable to load projects'
          )
        }
      } finally {
        if (active) setProjectsLoading(false)
      }
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [token, projectSearch])

  function selectProject(id: string) {
    setProjectId(id)

    if (!id) {
      setSelectedProject(null)
      return
    }

    const project = projects.find(item => item.id === id)

    if (project) {
      setSelectedProject(project)
    }
  }

  function validHours(value: string) {
    if (!value.trim()) return true

    return /^\d+(\.\d{1,2})?$/.test(value) &&
      Number.isFinite(Number(value)) &&
      Number(value) >= 0 &&
      Number(value) <= 999999.99
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    setError('')

    const cleanTitle = title.trim()

    if (
      cleanTitle.length < 2 ||
      cleanTitle.length > 150 ||
      !/\p{L}/u.test(cleanTitle)
    ) {
      setError('Enter a valid task title between 2 and 150 characters')
      return
    }

    if (!projectId) {
      setError('Please select a project')
      return
    }

    if (startDate && dueDate && dueDate < startDate) {
      setError('Due date cannot be earlier than start date')
      return
    }

    if (!validHours(estimatedHours) || !validHours(actualHours)) {
      setError('Hours must be between 0 and 999999.99 with up to two decimal places')
      return
    }

    if (description.trim().length > 5000) {
      setError('Description cannot exceed 5000 characters')
      return
    }

    const data: TaskInput = {
      title: cleanTitle,
      description: description.trim() || null,
      projectId,
      status,
      priority,
      startDate: startDate
        ? new Date(startDate + 'T00:00:00Z').toISOString()
        : null,
      dueDate: dueDate
        ? new Date(dueDate + 'T00:00:00Z').toISOString()
        : null,
      estimatedHours: estimatedHours.trim()
        ? Number(estimatedHours)
        : null,
      actualHours: actualHours.trim()
        ? Number(actualHours)
        : null
    }

    setSaving(true)

    try {
      await onSave(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save task'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 id="task-form-title" className="text-xl font-semibold text-slate-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {task
                ? 'Update task information'
                : 'Add a new task to your project'}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close task form"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="task-title" className={labelClass}>
              Task Title *
            </label>

            <input
              id="task-title"
              className={inputClass}
              value={title}
              onChange={event => setTitle(event.target.value)}
              maxLength={150}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label htmlFor="task-project-search" className={labelClass}>
              Search Projects
            </label>

            <input
              id="task-project-search"
              className={inputClass}
              value={projectSearch}
              maxLength={100}
              onChange={event => setProjectSearch(event.target.value)}
              placeholder="Search by project or client name"
            />

            <label htmlFor="task-project" className={`${labelClass} mt-2`}>
              Project *
            </label>

            <select
              id="task-project"
              className={inputClass}
              value={projectId}
              onChange={event => selectProject(event.target.value)}
              required
            >
              <option value="">Select a project</option>

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

            {projectsLoading && (
              <p className="mt-1 text-xs text-slate-500">
                Loading projects...
              </p>
            )}

            {projectError && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {projectError}
              </p>
            )}

            {!projectsLoading && !projectError && projects.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                No matching projects. Create a project first if needed.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-status" className={labelClass}>Status</label>

              <select
                id="task-status"
                className={inputClass}
                value={status}
                onChange={event => setStatus(event.target.value as TaskStatus)}
              >
                {TASK_STATUSES.map(item => (
                  <option key={item} value={item}>
                    {TASK_STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className={labelClass}>Priority</label>

              <select
                id="task-priority"
                className={inputClass}
                value={priority}
                onChange={event => setPriority(event.target.value as TaskPriority)}
              >
                {TASK_PRIORITIES.map(item => (
                  <option key={item} value={item}>
                    {TASK_PRIORITY_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-start" className={labelClass}>Start Date</label>

              <input
                id="task-start"
                type="date"
                className={inputClass}
                value={startDate}
                onChange={event => setStartDate(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="task-due" className={labelClass}>Due Date</label>

              <input
                id="task-due"
                type="date"
                className={inputClass}
                value={dueDate}
                min={startDate || undefined}
                onChange={event => setDueDate(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="task-estimated" className={labelClass}>
                Estimated Hours
              </label>

              <input
                id="task-estimated"
                type="number"
                min="0"
                max="999999.99"
                step="0.01"
                className={inputClass}
                value={estimatedHours}
                onChange={event => setEstimatedHours(event.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="task-actual" className={labelClass}>
                Actual Hours
              </label>

              <input
                id="task-actual"
                type="number"
                min="0"
                max="999999.99"
                step="0.01"
                className={inputClass}
                value={actualHours}
                onChange={event => setActualHours(event.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-description" className={labelClass}>
              Description
            </label>

            <textarea
              id="task-description"
              rows={4}
              maxLength={5000}
              className={inputClass}
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Describe the task..."
            />
          </div>

          <footer className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}

              {saving
                ? 'Saving...'
                : task
                  ? 'Update Task'
                  : 'Create Task'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
