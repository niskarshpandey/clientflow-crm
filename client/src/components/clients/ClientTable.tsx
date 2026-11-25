import { Users, Eye, Pencil, Trash2 } from 'lucide-react'
import type { Client } from '../../types/client'
import ClientStatusBadge from './ClientStatusBadge'

interface Props {
  clients: Client[]
  onView: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export default function ClientTable({
  clients,
  onView,
  onEdit,
  onDelete
}: Props) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="rounded-full bg-slate-100 p-4 text-slate-400">
          <Users size={28} />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No clients found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Add a new client or change your search filters.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-6 py-4 font-semibold">Client</th>
            <th className="px-6 py-4 font-semibold">Company</th>
            <th className="px-6 py-4 font-semibold">Industry</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Source</th>
            <th className="px-6 py-4 font-semibold">Created</th>
            <th className="px-6 py-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {clients.map(client => (
            <tr key={client.id} className="hover:bg-slate-50/70">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    {client.name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => onView(client)}
                      className="font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {client.name}
                    </button>

                    <p className="mt-1 text-xs text-slate-500">
                      {client.email || client.phone || 'No contact information'}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 text-slate-600">
                {client.company || '-'}
              </td>

              <td className="px-6 py-4 text-slate-600">
                {client.industry || '-'}
              </td>

              <td className="px-6 py-4">
                <ClientStatusBadge status={client.status} />
              </td>

              <td className="px-6 py-4">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {client.leadId ? 'Linked Lead' : 'No Linked Lead'}
                </span>
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                {new Date(client.createdAt).toLocaleDateString('en-IN')}
              </td>

              <td className="px-6 py-4">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    title="View client"
                    aria-label={`View ${client.name}`}
                    onClick={() => onView(client)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    type="button"
                    title="Edit client"
                    aria-label={`Edit ${client.name}`}
                    onClick={() => onEdit(client)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    title="Delete client"
                    aria-label={`Delete ${client.name}`}
                    onClick={() => onDelete(client)}
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
