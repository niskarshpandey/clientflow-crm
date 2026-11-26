import type {
  ProjectStatus,
  ProjectPriority
} from '../../types/project'

const statusStyles: Record<ProjectStatus, string> = {
  PLANNING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  ON_HOLD: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700'
}

const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

const priorityStyles: Record<ProjectPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700'
}

const priorityLabels: Record<ProjectPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
}

export function ProjectStatusBadge({
  status
}: {
  status: ProjectStatus
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}

export function ProjectPriorityBadge({
  priority
}: {
  priority: ProjectPriority
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  )
}
