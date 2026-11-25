import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  name: string
  deleting: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteClientDialog({
  name,
  deleting,
  error,
  onCancel,
  onConfirm
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-client-title"
        aria-describedby="delete-client-description"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={24} />
        </div>

        <h2 id="delete-client-title" className="text-lg font-bold text-slate-900">
          Delete Client?
        </h2>

        <p id="delete-client-description" className="mt-2 text-sm leading-6 text-slate-600">
          Are you sure you want to delete <strong>{name}</strong>?
          This action permanently removes the client record and cannot be undone.
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Any original linked lead will remain in the system.
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
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && <Loader2 size={16} className="animate-spin" />}
            {deleting ? 'Deleting...' : 'Delete Client'}
          </button>
        </div>
      </section>
    </div>
  )
}
