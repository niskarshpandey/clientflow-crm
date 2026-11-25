import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  name: string
  deleting: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteLeadDialog({
  name,
  deleting,
  error,
  onCancel,
  onConfirm
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={24} />
        </div>

        <h2 id="delete-title" className="text-xl font-bold text-slate-900">
          Delete Lead?
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Are you sure you want to delete {name}?
          This action cannot be undone.
        </p>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            autoFocus
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && <Loader2 size={16} className="animate-spin" />}
            {deleting ? 'Deleting...' : 'Delete Lead'}
          </button>
        </div>
      </section>
    </div>
  )
}
