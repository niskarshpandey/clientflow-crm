import { X, Pencil } from 'lucide-react'
import type { ReactNode } from 'react'

import type { Task } from '../../types/task'

import {
  TaskStatusBadge,
  TaskPriorityBadge
} from './TaskBadges'

interface Props {
  task: Task
  onClose: () => void
  onEdit: (task: Task) => void
}

function formatDate(value: string | null) {
  if (!value) return 'Not specified'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(value))
}

function DetailItem({
  label,
  children
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-3">
      <p className="mb-1 text-xs font-medium text-slate-500">
        {label}
      </p>

      <div className="break-words text-sm font-medium text-slate-800">
        {children}
      </div>
    </div>
  )
}

export default function TaskDetails({
  task,
  onClose,
  onEdit
}: Props) {
  const estimated = task.estimatedHours === null
    ? null
    : Number(task.estimatedHours)

  const actual = task.actualHours === null
    ? null
    : Number(task.actualHours)

  const variance = estimated !== null && actual !== null
    ? actual - estimated
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 p-5">
          <div className="min-w-0">
            <h2
              id="task-details-title"
              className="break-words text-xl font-semibold text-slate-900"
            >
              {task.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Task details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Project">
              {task.project.name}
            </DetailItem>

            <DetailItem label="Client">
              {task.project.client.name}
            </DetailItem>

            <DetailItem label="Start Date">
              {formatDate(task.startDate)}
            </DetailItem>

            <DetailItem label="Due Date">
              {formatDate(task.dueDate)}
            </DetailItem>

            <DetailItem label="Estimated Hours">
              {estimated === null ? 'Not specified' : `${estimated} hrs`}
            </DetailItem>

            <DetailItem label="Actual Hours">
              {actual === null ? 'Not specified' : `${actual} hrs`}
            </DetailItem>

            <DetailItem label="Completed Date">
              {formatDate(task.completedAt)}
            </DetailItem>

            <DetailItem label="Created Date">
              {formatDate(task.createdAt)}
            </DetailItem>

            <DetailItem label="Last Updated">
              {formatDate(task.updatedAt)}
            </DetailItem>
          </div>

          {variance !== null && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">
                Time Comparison
              </h3>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-600">
                  Estimated vs actual hours
                </span>

                <span className={`text-sm font-semibold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {variance > 0
                    ? `${variance.toFixed(2)} hrs over estimate`
                    : variance < 0
                      ? `${Math.abs(variance).toFixed(2)} hrs below estimate`
                      : 'On estimate'}
                </span>
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              Description
            </h3>

            <p className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              {task.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil size={16} />
            Edit Task
          </button>
        </footer>
      </section>
    </div>
  )
}
