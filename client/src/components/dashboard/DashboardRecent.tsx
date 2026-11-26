import { Link } from 'react-router-dom'

import type { ReactNode } from 'react'

import type {
  DashboardOverview
} from '../../types/dashboard'

interface Props {
  recent: DashboardOverview['recent']
}

interface SectionProps {
  title: string
  path: string
  children: ReactNode
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
})

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NEW: 'bg-blue-50 text-blue-700',
    CONTACTED: 'bg-cyan-50 text-cyan-700',
    QUALIFIED: 'bg-purple-50 text-purple-700',
    PROPOSAL: 'bg-amber-50 text-amber-700',
    NEGOTIATION: 'bg-orange-50 text-orange-700',
    WON: 'bg-emerald-50 text-emerald-700',
    LOST: 'bg-red-50 text-red-700',
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-red-50 text-red-700',
    IN_PROGRESS: 'bg-blue-50 text-blue-700',
    IN_REVIEW: 'bg-purple-50 text-purple-700',
    ON_HOLD: 'bg-amber-50 text-amber-700'
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${colors[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {formatStatus(status)}
    </span>
  )
}

function Section({
  title,
  path,
  children
}: SectionProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <Link
          to={path}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          View all
        </Link>
      </div>

      {children}
    </section>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="p-6 text-center text-sm text-slate-500">
      {message}
    </p>
  )
}

export default function DashboardRecent({
  recent
}: Props) {
  return (
    <div className="space-y-6">

      <Section title="Recent Leads" path="/leads">
        {recent.leads.length === 0 ? (
          <EmptyState message="No leads available yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Value</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody>
                {recent.leads.map(lead => (
                  <tr
                    key={lead.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {lead.name}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {lead.company || '-'}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={lead.status} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                      {currency.format(Number(lead.value))}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {dateFormatter.format(new Date(lead.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">

        <Section title="Recent Projects" path="/projects">
          {recent.projects.length === 0 ? (
            <EmptyState message="No projects available yet." />
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.projects.map(project => (
                <div
                  key={project.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-5"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-slate-900">
                      {project.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {project.client.name}
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {currency.format(Number(project.budget))}
                    </p>
                  </div>

                  <StatusBadge status={project.status} />
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recent Tasks" path="/tasks">
          {recent.tasks.length === 0 ? (
            <EmptyState message="No tasks available yet." />
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.tasks.map(task => (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-5"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-slate-900">
                      {task.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {task.project.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Created {dateFormatter.format(new Date(task.createdAt))}
                    </p>
                  </div>

                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>
    </div>
  )
}
