import type {
  LeadStatus,
  LeadPriority
} from '../../types/lead'

const statusStyles: Record<LeadStatus, string> = {
  NEW: 'bg-blue-50 text-blue-700',
  CONTACTED: 'bg-cyan-50 text-cyan-700',
  QUALIFIED: 'bg-violet-50 text-violet-700',
  PROPOSAL: 'bg-amber-50 text-amber-700',
  NEGOTIATION: 'bg-orange-50 text-orange-700',
  WON: 'bg-emerald-50 text-emerald-700',
  LOST: 'bg-red-50 text-red-700'
}

const priorityStyles: Record<LeadPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-orange-50 text-orange-700',
  URGENT: 'bg-red-50 text-red-700'
}

export function LeadStatusBadge({
  status
}: {
  status: LeadStatus
}) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

export function LeadPriorityBadge({
  priority
}: {
  priority: LeadPriority
}) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[priority]}`}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  )
}
