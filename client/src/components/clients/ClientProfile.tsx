import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  MapPin,
  Briefcase,
  CalendarDays,
  Pencil,
  Link2
} from 'lucide-react'

import type { Client } from '../../types/client'
import ClientStatusBadge from './ClientStatusBadge'

interface Props {
  client: Client
  onClose: () => void
  onEdit: (client: Client) => void
}

export default function ClientProfile({
  client,
  onClose,
  onEdit
}: Props) {
  const details = [
    { label: 'Email', value: client.email, icon: Mail },
    { label: 'Phone', value: client.phone, icon: Phone },
    { label: 'Company', value: client.company, icon: Building2 },
    { label: 'Website', value: client.website, icon: Globe },
    { label: 'Industry', value: client.industry, icon: Briefcase },
    { label: 'Address', value: client.address, icon: MapPin },
    {
      label: 'Client Since',
      value: new Date(client.createdAt).toLocaleDateString('en-IN'),
      icon: CalendarDays
    },
    {
      label: 'Lead Association',
      value: client.leadId ? 'Linked to a lead' : 'No linked lead',
      icon: Link2
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-profile-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 id="client-profile-title" className="text-xl font-bold text-slate-900">
            Client Profile
          </h2>

          <button
            type="button"
            aria-label="Close client profile"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <User size={30} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="break-words text-xl font-bold text-slate-900">
                {client.name}
              </h3>

              <p className="mb-2 text-sm text-slate-500">
                {client.company || 'Individual Client'}
              </p>

              <ClientStatusBadge status={client.status} />
            </div>

            <button
              type="button"
              onClick={() => onEdit(client)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {details.map(item => {
              const Icon = item.icon

              return (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      {item.label}
                    </p>

                    <p className="mt-1 break-words text-sm font-medium text-slate-900">
                      {item.value || 'Not provided'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">Client Notes</h3>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">
              {client.notes || 'No notes added yet.'}
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 p-4">
            <h3 className="font-semibold text-slate-700">Business Activity</h3>

            <p className="mt-1 text-sm text-slate-500">
              Projects, tasks, invoices and payment history will be connected in future modules.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
