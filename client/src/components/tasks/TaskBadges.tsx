import type {
  TaskStatus,
  TaskPriority
} from '../../types/task'

import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS
} from '../../types/task'

const statusStyles: Record<TaskStatus, string> = {
  TO_DO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700'
}

const priorityStyles: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700'
}

export function TaskStatusBadge({
  status
}: {
  status: TaskStatus
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  )
}

export function TaskPriorityBadge({
  priority
}: {
  priority: TaskPriority
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[priority]}`}
    >
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  )
}
