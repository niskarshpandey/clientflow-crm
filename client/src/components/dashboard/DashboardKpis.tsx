import {
  Users,
  ContactRound,
  IndianRupee,
  TrendingUp,
  FolderKanban,
  ClipboardList,
  CheckCircle2,
  Clock3,
  Wallet,
  Target
} from 'lucide-react'

import type {
  DashboardKpis as DashboardKpiData
} from '../../types/dashboard'

interface Props {
  kpis: DashboardKpiData
}

const numberFormatter = new Intl.NumberFormat('en-IN')

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
})

export default function DashboardKpis({ kpis }: Props) {
  const stats = [
    {
      title: 'Total Leads',
      value: numberFormatter.format(kpis.totalLeads),
      subtitle: `${kpis.wonLeads} won leads`,
      icon: ContactRound,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Active Clients',
      value: numberFormatter.format(kpis.activeClients),
      subtitle: `${kpis.totalClients} total clients`,
      icon: Users,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Active Projects',
      value: numberFormatter.format(kpis.activeProjects),
      subtitle: `${kpis.totalProjects} total projects`,
      icon: FolderKanban,
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Total Tasks',
      value: numberFormatter.format(kpis.totalTasks),
      subtitle: `${kpis.cancelledTasks} cancelled`,
      icon: ClipboardList,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Open Pipeline Value',
      value: currencyFormatter.format(
        Number(kpis.openPipelineValue)
      ),
      subtitle: 'Potential deal value',
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Won Lead Value',
      value: currencyFormatter.format(
        Number(kpis.wonLeadValue)
      ),
      subtitle: 'Value of won deals',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Project Budget',
      value: currencyFormatter.format(
        Number(kpis.totalProjectBudget)
      ),
      subtitle: 'Excludes cancelled projects',
      icon: Wallet,
      color: 'bg-cyan-50 text-cyan-600'
    },
    {
      title: 'Lead Conversion',
      value: `${kpis.leadConversionRate}%`,
      subtitle: 'Won leads / total leads',
      icon: Target,
      color: 'bg-violet-50 text-violet-600'
    },
    {
      title: 'Completed Tasks',
      value: numberFormatter.format(kpis.completedTasks),
      subtitle: 'Successfully completed',
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Overdue Tasks',
      value: numberFormatter.format(kpis.overdueTasks),
      subtitle: 'Requires attention',
      icon: Clock3,
      color: 'bg-red-50 text-red-600'
    },
    {
      title: 'Task Completion',
      value: `${kpis.taskCompletionRate}%`,
      subtitle: 'Excludes cancelled tasks',
      icon: CheckCircle2,
      color: 'bg-teal-50 text-teal-600'
    },
    {
      title: 'Lost Leads',
      value: numberFormatter.format(kpis.lostLeads),
      subtitle: 'Closed unsuccessful deals',
      icon: ContactRound,
      color: 'bg-slate-100 text-slate-600'
    }
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(stat => {
        const Icon = stat.icon

        return (
          <div
            key={stat.title}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-500">
                {stat.title}
              </span>

              <div className={`shrink-0 rounded-xl p-2 ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>

            <p className="mt-4 break-words text-2xl font-bold text-slate-900">
              {stat.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {stat.subtitle}
            </p>
          </div>
        )
      })}
    </div>
  )
}
