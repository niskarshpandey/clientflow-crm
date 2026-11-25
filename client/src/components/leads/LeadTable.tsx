import { Pencil, Trash2, Users, UserCheck } from 'lucide-react'

import type { Lead } from '../../types/lead'

import {
  LeadStatusBadge,
  LeadPriorityBadge
} from './LeadBadges'

interface Props {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
  onConvert: (lead: Lead) => void
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
})

export default function LeadTable({
  leads,
  onEdit,
  onDelete,
  onConvert
}: Props) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
        <Users size={40} className="mb-4 text-slate-400" />
        <h3 className="font-semibold text-slate-800">No leads found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Add a new lead or change your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {['Lead', 'Company', 'Status', 'Priority', 'Deal Value', 'Source', 'Actions'].map(heading => (
              <th key={heading} className="px-5 py-4 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {leads.map(lead => (
            <tr key={lead.id} className="transition hover:bg-slate-50">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {lead.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {lead.email || lead.phone || 'No contact details'}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-4 text-slate-600">
                {lead.company || '-'}
              </td>

              <td className="px-5 py-4">
                <LeadStatusBadge status={lead.status} />
              </td>

              <td className="px-5 py-4">
                <LeadPriorityBadge priority={lead.priority} />
              </td>

              <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                {currency.format(Number(lead.value))}
              </td>

              <td className="px-5 py-4 text-slate-600">
                {lead.source || '-'}
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  {lead.status === 'WON' && (
                    <button
                      type="button"
                      title="Convert to Client"
                      aria-label={`Convert ${lead.name} to client`}
                      onClick={() => onConvert(lead)}
                      className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-50 px-2.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <UserCheck size={16} />
                      Convert
                    </button>
                  )}
                  <button
                    type="button"
                    title="Edit lead"
                    aria-label={`Edit ${lead.name}`}
                    onClick={() => onEdit(lead)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    title="Delete lead"
                    aria-label={`Delete ${lead.name}`}
                    onClick={() => onDelete(lead)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
