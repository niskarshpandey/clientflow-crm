import {
  Eye,
  Pencil,
  Trash2,
  FolderKanban
} from 'lucide-react'

import type { Project } from '../../types/project'

import {
  ProjectStatusBadge,
  ProjectPriorityBadge
} from './ProjectBadges'

interface Props {
  projects: Project[]
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

function formatBudget(value: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value))
}

function formatDate(value: string | null) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

export default function ProjectTable({
  projects,
  onView,
  onEdit,
  onDelete
}: Props) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
        <FolderKanban size={42} className="mx-auto mb-4 text-slate-300" />
        <h3 className="font-semibold text-slate-900">
          No projects found
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Create a project or change your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {[
              'Project',
              'Client',
              'Status',
              'Priority',
              'Budget',
              'Due Date',
              'Actions'
            ].map(title => (
              <th key={title} scope="col" className="px-5 py-4 font-semibold">
                {title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {projects.map(project => {
            const overdue =
              project.dueDate &&
              project.dueDate.slice(0, 10) <
                new Date().toISOString().slice(0, 10) &&
              project.status !== 'COMPLETED' &&
              project.status !== 'CANCELLED'

            return (
              <tr key={project.id} className="hover:bg-slate-50">

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                      <FolderKanban size={20} />
                    </div>
                    <div>
                      <p className="max-w-[220px] truncate font-semibold text-slate-900" title={project.name}>
                        {project.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Created {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-slate-700">
                    {project.client.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {project.client.company || '-'}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <ProjectStatusBadge status={project.status} />
                </td>

                <td className="px-5 py-4">
                  <ProjectPriorityBadge priority={project.priority} />
                </td>

                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                  {formatBudget(project.budget)}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <p className={overdue ? 'font-medium text-red-600' : 'text-slate-600'}>
                    {formatDate(project.dueDate)}
                  </p>

                  {overdue && (
                    <p className="mt-1 text-xs text-red-500">
                      Overdue
                    </p>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      title="View project"
                      aria-label={`View ${project.name}`}
                      onClick={() => onView(project)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      title="Edit project"
                      aria-label={`Edit ${project.name}`}
                      onClick={() => onEdit(project)}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      title="Delete project"
                      aria-label={`Delete ${project.name}`}
                      onClick={() => onDelete(project)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
