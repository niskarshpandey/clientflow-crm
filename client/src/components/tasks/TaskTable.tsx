import {
  Eye,
  Pencil,
  Trash2,
  ClipboardList
} from 'lucide-react'

import type { Task } from '../../types/task'

import {
  TaskStatusBadge,
  TaskPriorityBadge
} from './TaskBadges'

interface Props {
  tasks: Task[]
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

function formatDate(value: string | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(value))
}

function isOverdue(task: Task) {
  if (!task.dueDate) return false

  if (
    task.status === 'COMPLETED' ||
    task.status === 'CANCELLED'
  ) {
    return false
  }

  const today = new Date().toISOString().slice(0, 10)

  return task.dueDate.slice(0, 10) < today
}

export default function TaskTable({
  tasks,
  onView,
  onEdit,
  onDelete
}: Props) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
        <ClipboardList
          size={42}
          className="mx-auto mb-3 text-slate-400"
        />

        <h3 className="font-semibold text-slate-800">
          No tasks found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Create a task or change your search filters.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th scope="col" className="px-5 py-4">Task</th>
            <th scope="col" className="px-5 py-4">Project</th>
            <th scope="col" className="px-5 py-4">Status</th>
            <th scope="col" className="px-5 py-4">Priority</th>
            <th scope="col" className="px-5 py-4">Hours</th>
            <th scope="col" className="px-5 py-4">Due Date</th>
            <th scope="col" className="px-5 py-4">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-slate-50">
              <td className="max-w-[240px] px-5 py-4">
                <p className="break-words font-medium text-slate-900">
                  {task.title}
                </p>

                {task.description && (
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {task.description}
                  </p>
                )}
              </td>

              <td className="px-5 py-4">
                <p className="font-medium text-slate-700">
                  {task.project.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {task.project.client.name}
                </p>
              </td>

              <td className="px-5 py-4">
                <TaskStatusBadge status={task.status} />
              </td>

              <td className="px-5 py-4">
                <TaskPriorityBadge priority={task.priority} />
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                <p>
                  Est: {task.estimatedHours ?? '-'}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Actual: {task.actualHours ?? '-'}
                </p>
              </td>

              <td className="whitespace-nowrap px-5 py-4">
                <p className={isOverdue(task) ? 'font-medium text-red-600' : 'text-slate-600'}>
                  {formatDate(task.dueDate)}
                </p>

                {isOverdue(task) && (
                  <p className="mt-1 text-xs text-red-600">
                    Overdue
                  </p>
                )}
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="View task"
                    aria-label={`View ${task.title}`}
                    onClick={() => onView(task)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    type="button"
                    title="Edit task"
                    aria-label={`Edit ${task.title}`}
                    onClick={() => onEdit(task)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    title="Delete task"
                    aria-label={`Delete ${task.title}`}
                    onClick={() => onDelete(task)}
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
