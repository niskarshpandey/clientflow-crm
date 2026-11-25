import type { ClientStatus } from '../../types/client'

const statusStyles: Record<ClientStatus, string> = {
  PROSPECT: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  INACTIVE: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  ARCHIVED: 'bg-slate-100 text-slate-600 ring-slate-500/20'
}

const statusLabels: Record<ClientStatus, string> = {
  PROSPECT: 'Prospect',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ARCHIVED: 'Archived'
}

export default function ClientStatusBadge({
  status
}: {
  status: ClientStatus
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

      {statusLabels[status]}
    </span>
  )
}
