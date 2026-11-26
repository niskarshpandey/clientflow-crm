import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { X, Loader2, Search } from 'lucide-react'

import { clientsApi } from '../../api/clients'

import type { Client } from '../../types/client'

import type {
  Project,
  ProjectInput,
  ProjectStatus,
  ProjectPriority
} from '../../types/project'

import {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES
} from '../../types/project'

interface Props {
  project?: Project
  token: string
  onClose: () => void
  onSave: (data: ProjectInput) => Promise<void>
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

function dateInput(value?: string | null) {
  return value ? value.slice(0, 10) : ''
}

export default function ProjectForm({
  project,
  token,
  onClose,
  onSave
}: Props) {
  const [name, setName] = useState(project?.name ?? '')
  const [description, setDescription] = useState(
    project?.description ?? ''
  )
  const [clientId, setClientId] = useState(
    project?.clientId ?? ''
  )
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? 'PLANNING'
  )
  const [priority, setPriority] = useState<ProjectPriority>(
    project?.priority ?? 'MEDIUM'
  )
  const [budget, setBudget] = useState(
    project?.budget ?? '0'
  )
  const [startDate, setStartDate] = useState(
    dateInput(project?.startDate)
  )
  const [dueDate, setDueDate] = useState(
    dateInput(project?.dueDate)
  )

  const [clients, setClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientError, setClientError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [selectedClient, setSelectedClient] = useState(
    project?.client
      ? {
          id: project.client.id,
          name: project.client.name,
          company: project.client.company
        }
      : null
  )

  useEffect(() => {
    let active = true

    const timer = window.setTimeout(async () => {
      setClientsLoading(true)
      setClientError('')

      try {
        const response = await clientsApi.list(token, {
          search: clientSearch.trim() || undefined,
          page: 1,
          limit: 100
        })

        if (active) {
          setClients(response.data)
        }
      } catch (err) {
        if (active) {
          setClients([])
          setClientError(
            err instanceof Error
              ? err.message
              : 'Unable to load clients'
          )
        }
      } finally {
        if (active) setClientsLoading(false)
      }
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [token, clientSearch])

  function selectClient(id: string) {
    setClientId(id)

    const client = clients.find(item => item.id === id)

    if (client) {
      setSelectedClient({
        id: client.id,
        name: client.name,
        company: client.company
      })
    } else if (id !== selectedClient?.id) {
      setSelectedClient(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    setError('')

    const cleanName = name.trim()
    const amount = Number(budget)

    if (
      cleanName.length < 2 ||
      cleanName.length > 150 ||
      !/\p{L}/u.test(cleanName)
    ) {
      setError('Enter a valid project name')
      return
    }

    if (!clientId) {
      setError('Please select a client')
      return
    }

    if (
      budget.trim() === '' ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      amount > 9999999999.99 ||
      !/^\d+(\.\d{1,2})?$/.test(budget.trim())
    ) {
      setError('Enter a valid budget with up to two decimal places')
      return
    }

    if (startDate && dueDate && dueDate < startDate) {
      setError('Due date cannot be earlier than start date')
      return
    }

    const data: ProjectInput = {
      name: cleanName,
      description: description.trim() || null,
      clientId,
      status,
      priority,
      budget: amount,
      startDate: startDate
        ? new Date(startDate + 'T00:00:00Z').toISOString()
        : null,
      dueDate: dueDate
        ? new Date(dueDate + 'T00:00:00Z').toISOString()
        : null
    }

    setSaving(true)

    try {
      await onSave(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save project'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 id="project-form-title" className="text-xl font-bold text-slate-900">
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your project information
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">

          {error && (
            <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <fieldset disabled={saving} className="space-y-5">

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Project Name *
              </span>
              <input
                required
                maxLength={150}
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputClass}
                placeholder="Enter project name"
              />
            </label>

            <div className="space-y-2">
              <label htmlFor="project-client-search" className="text-sm font-medium text-slate-700">
                Search Client
              </label>

              <div className="relative">
                <Search size={17} className="absolute left-3 top-3 text-slate-400" />

                <input
                  id="project-client-search"
                  value={clientSearch}
                  maxLength={100}
                  onChange={e => setClientSearch(e.target.value)}
                  placeholder="Search by name or company"
                  className={inputClass + ' pl-10'}
                />
              </div>

              <label htmlFor="project-client" className="text-sm font-medium text-slate-700">
                Select Client *
              </label>

              <select
                id="project-client"
                required
                value={clientId}
                onChange={e => selectClient(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a client</option>

                {selectedClient &&
                  !clients.some(c => c.id === selectedClient.id) && (
                    <option value={selectedClient.id}>
                      {selectedClient.name}
                      {selectedClient.company
                        ? ` - ${selectedClient.company}`
                        : ''}
                    </option>
                  )}

                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                    {client.company ? ` - ${client.company}` : ''}
                  </option>
                ))}
              </select>

              {clientsLoading && (
                <p className="text-xs text-slate-500">
                  Loading clients...
                </p>
              )}

              {clientError && (
                <p role="alert" className="text-xs text-red-600">
                  {clientError}
                </p>
              )}

              {!clientsLoading && !clientError && clients.length === 0 && (
                <p className="text-xs text-slate-500">
                  No matching clients. Create a client first if needed.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Status
                </span>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ProjectStatus)}
                  className={inputClass}
                >
                  {PROJECT_STATUSES.map(item => (
                    <option key={item} value={item}>
                      {item.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Priority
                </span>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as ProjectPriority)}
                  className={inputClass}
                >
                  {PROJECT_PRIORITIES.map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Budget (INR)
              </span>
              <input
                type="number"
                min="0"
                max="9999999999.99"
                step="0.01"
                required
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className={inputClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Start Date
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Due Date
                </span>
                <input
                  type="date"
                  min={startDate || undefined}
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Description
              </span>
              <textarea
                rows={4}
                maxLength={5000}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter project requirements"
                className={inputClass}
              />
            </label>

          </fieldset>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}

              {saving
                ? 'Saving...'
                : project
                  ? 'Update Project'
                  : 'Create Project'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
