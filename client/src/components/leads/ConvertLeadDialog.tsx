import { ArrowRight, Loader2, UserCheck } from 'lucide-react'
import type { Lead } from '../../types/lead'

interface Props {
  lead: Lead
  converting: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

export default function ConvertLeadDialog({
  lead,
  converting,
  error,
  onCancel,
  onConfirm
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-lead-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <UserCheck size={24} />
        </div>

        <h2 id="convert-lead-title" className="text-xl font-bold text-slate-900">
          Convert Lead to Client
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Convert <strong>{lead.name}</strong> into an active client?
          Contact and company information will be transferred automatically.
        </p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">
            {lead.name}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {lead.company || 'Individual Client'}
          </p>

          <div className="mt-4 flex items-center gap-3 text-sm font-medium">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              WON Lead
            </span>

            <ArrowRight size={18} className="text-slate-400" />

            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              Active Client
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          The original lead record will remain available.
        </p>

        {error && (
          <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            disabled={converting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={converting}
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {converting && (
              <Loader2 size={16} className="animate-spin" />
            )}

            {converting ? 'Converting...' : 'Convert to Client'}
          </button>
        </div>
      </section>
    </div>
  )
}
