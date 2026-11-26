import {
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface Props {
  name: string
  deleting: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteProjectDialog({
  name,
  deleting,
  error,
  onCancel,
  onConfirm
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        aria-describedby="delete-project-description"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={24} />
        </div>

        <h2 id="delete-project-title" className="text-xl font-bold text-slate-900">
          Delete Project?
        </h2>

        <p id="delete-project-description" className="mt-3 break-words text-sm leading-relaxed text-slate-600">
          Are you sure you want to delete{' '}
          <strong>{name}</strong>?
          This action is permanent and cannot be undone.
          The associated client will not be deleted.
        </p>

        {error && (
          <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting && <Loader2 size={16} className="animate-spin" />}
            {deleting ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
