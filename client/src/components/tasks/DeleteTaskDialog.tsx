import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  title: string
  deleting: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteTaskDialog({
  title,
  deleting,
  error,
  onCancel,
  onConfirm
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-task-title"
        aria-describedby="delete-task-description"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={24} className="text-red-600" />
        </div>

        <h2
          id="delete-task-title"
          className="text-lg font-semibold text-slate-900"
        >
          Delete Task?
        </h2>

        <p
          id="delete-task-description"
          className="mt-2 break-words text-sm leading-6 text-slate-600"
        >
          Are you sure you want to permanently delete
          <strong> {title}</strong>?
          This action cannot be undone.
        </p>

        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          The associated project and client will not be deleted.
          Project task progress will be recalculated.
        </div>

        {error && (
          <div role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && (
              <Loader2 size={16} className="animate-spin" />
            )}

            {deleting ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </section>
    </div>
  )
}
