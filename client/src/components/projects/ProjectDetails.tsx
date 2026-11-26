import ProjectTaskProgress from '../tasks/ProjectTaskProgress'
import {
  X,
  Pencil,
  FolderKanban
} from 'lucide-react'

import type { Project } from '../../types/project'

import {
  ProjectStatusBadge,
  ProjectPriorityBadge
} from './ProjectBadges'

interface Props {
  project: Project
  onClose: () => void
  onEdit: (project: Project) => void
}

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
      })
    : 'Not specified'
}

export default function ProjectDetails({
  project,
  onClose,
  onEdit
}: Props) {
  const budget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(Number(project.budget))

  const details = [
    { label: 'Client Name', value: project.client.name },
    { label: 'Company', value: project.client.company || '-' },
    { label: 'Project Budget', value: budget },
    { label: 'Start Date', value: formatDate(project.startDate) },
    { label: 'Due Date', value: formatDate(project.dueDate) },
    { label: 'Completed On', value: formatDate(project.completedAt) },
    { label: 'Created On', value: formatDate(project.createdAt) },
    { label: 'Last Updated', value: formatDate(project.updatedAt) }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <FolderKanban size={26} />
            </div>

            <div>
              <h2 id="project-details-title" className="break-words text-xl font-bold text-slate-900">
                {project.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Project overview
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close project details"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">

          <div className="flex flex-wrap gap-2">
            <ProjectStatusBadge status={project.status} />
            <ProjectPriorityBadge priority={project.priority} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {details.map(item => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="text-xs font-medium text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 break-words font-semibold text-slate-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-slate-900">
              Description
            </h3>
            <div className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
              {project.description || 'No description provided.'}
            </div>
          </div>

          <ProjectTaskProgress projectId={project.id} />

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => onEdit(project)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Pencil size={16} />
              Edit Project
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
