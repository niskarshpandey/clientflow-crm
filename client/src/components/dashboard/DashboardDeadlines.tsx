import {
  CalendarDays,
  FolderKanban,
  ClipboardList
} from 'lucide-react'

import { Link } from 'react-router-dom'

import type {
  DashboardOverview
} from '../../types/dashboard'

interface Props {
  upcoming: DashboardOverview['upcoming']
}

const formatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
})

export default function DashboardDeadlines({
  upcoming
}: Props) {
  const deadlines = [
    ...upcoming.projects.map(project => ({
      id: project.id,
      title: project.name,
      description: 'Project deadline',
      type: 'project' as const,
      dueDate: project.dueDate,
      priority: project.priority,
      path: '/projects'
    })),

    ...upcoming.tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.project.name,
      type: 'task' as const,
      dueDate: task.dueDate,
      priority: task.priority,
      path: '/tasks'
    }))
  ]
    .filter(item => item.dueDate !== null)
    .sort((a, b) =>
      (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
    )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center gap-3 border-b border-slate-100 p-5">
        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
          <CalendarDays size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Upcoming Deadlines
          </h2>

          <p className="text-xs text-slate-500">
            Today and the next 7 calendar days
          </p>
        </div>
      </div>

      {deadlines.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">
          No upcoming deadlines.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {deadlines.map(item => {
            const Icon = item.type === 'project'
              ? FolderKanban
              : ClipboardList

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0 rounded-xl bg-slate-100 p-3 text-slate-600">
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0">
                    <Link
                      to={item.path}
                      className="break-words font-medium text-slate-900 hover:text-indigo-600"
                    >
                      {item.title}
                    </Link>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    {item.dueDate
                      ? formatter.format(new Date(item.dueDate))
                      : '-'}
                  </p>

                  <p className={`mt-1 text-xs font-medium ${
                    item.priority === 'URGENT' ||
                    item.priority === 'HIGH'
                      ? 'text-red-600'
                      : 'text-slate-500'
                  }`}>
                    {item.priority} priority
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
