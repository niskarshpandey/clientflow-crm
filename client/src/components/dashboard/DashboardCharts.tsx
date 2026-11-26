import type {
  DashboardOverview
} from '../../types/dashboard'

interface ChartItem {
  label: string
  count: number
  color: string
}

interface DistributionChartProps {
  title: string
  items: ChartItem[]
}

function DistributionChart({
  title,
  items
}: DistributionChartProps) {
  const total = items.reduce(
    (sum, item) => sum + item.count,
    0
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {total} total
        </span>
      </div>

      {total === 0 && (
        <p className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
          No records available yet.
        </p>
      )}

      <div className="space-y-4">
        {items.map(item => {
          const percentage = total > 0
            ? (item.count / total) * 100
            : 0

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">
                  {item.label}
                </span>

                <span className="text-slate-500">
                  {item.count} ({Math.round(percentage)}%)
                </span>
              </div>

              <div
                role="progressbar"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(percentage)}
                className="h-2.5 overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{
                    width: `${percentage}%`
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

interface Props {
  distributions: DashboardOverview['distributions']
}

function createItems(
  data: { status: string; count: number }[],
  config: {
    status: string
    label: string
    color: string
  }[]
): ChartItem[] {
  return config.map(item => ({
    label: item.label,
    color: item.color,
    count: data.find(
      row => row.status === item.status
    )?.count ?? 0
  }))
}

export default function DashboardCharts({
  distributions
}: Props) {
  const leads = createItems(distributions.leads, [
    { status: 'NEW', label: 'New', color: 'bg-blue-500' },
    { status: 'CONTACTED', label: 'Contacted', color: 'bg-cyan-500' },
    { status: 'QUALIFIED', label: 'Qualified', color: 'bg-purple-500' },
    { status: 'PROPOSAL', label: 'Proposal', color: 'bg-amber-500' },
    { status: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-500' },
    { status: 'WON', label: 'Won', color: 'bg-emerald-500' },
    { status: 'LOST', label: 'Lost', color: 'bg-red-500' }
  ])

  const clients = createItems(distributions.clients, [
    { status: 'PROSPECT', label: 'Prospect', color: 'bg-blue-500' },
    { status: 'ACTIVE', label: 'Active', color: 'bg-emerald-500' },
    { status: 'INACTIVE', label: 'Inactive', color: 'bg-amber-500' },
    { status: 'ARCHIVED', label: 'Archived', color: 'bg-slate-400' }
  ])

  const projects = createItems(distributions.projects, [
    { status: 'PLANNING', label: 'Planning', color: 'bg-slate-400' },
    { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
    { status: 'ON_HOLD', label: 'On Hold', color: 'bg-amber-500' },
    { status: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500' },
    { status: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' }
  ])

  const tasks = createItems(distributions.tasks, [
    { status: 'TO_DO', label: 'To Do', color: 'bg-slate-400' },
    { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
    { status: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-500' },
    { status: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500' },
    { status: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' }
  ])

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <DistributionChart
        title="Sales Pipeline"
        items={leads}
      />

      <DistributionChart
        title="Task Distribution"
        items={tasks}
      />

      <DistributionChart
        title="Project Distribution"
        items={projects}
      />

      <DistributionChart
        title="Client Distribution"
        items={clients}
      />
    </div>
  )
}
