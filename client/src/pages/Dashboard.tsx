import {
  Users,
  ContactRound,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

const stats = [
  {
    title: "Total Clients",
    value: "128",
    change: "+12.5%",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Active Leads",
    value: "42",
    change: "+8.2%",
    icon: ContactRound,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Total Revenue",
    value: "₹4,85,000",
    change: "+18.4%",
    icon: IndianRupee,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Conversion Rate",
    value: "24.8%",
    change: "+3.1%",
    icon: TrendingUp,
    color: "bg-orange-50 text-orange-600",
  },
];

const leads = [
  {
    name: "Rahul Sharma",
    company: "TechNova",
    status: "Qualified",
    value: "₹45,000",
  },
  {
    name: "Priya Verma",
    company: "PixelCraft",
    status: "New",
    value: "₹28,000",
  },
  {
    name: "Aman Gupta",
    company: "GrowthLabs",
    status: "Proposal",
    value: "₹75,000",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your business.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {stat.title}
                </span>

                <div className={`rounded-xl p-2 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-5">
                <p className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="flex items-center text-xs font-semibold text-emerald-600">
                    <ArrowUpRight size={14} />
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline and activity */}
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Sales Pipeline
            </h2>
            <span className="text-xs text-slate-400">Demo data</span>
          </div>

          <div className="space-y-5">
            {[
              {
                stage: "New Leads",
                count: 18,
                width: "75%",
                color: "bg-blue-500",
              },
              {
                stage: "Qualified",
                count: 12,
                width: "55%",
                color: "bg-purple-500",
              },
              {
                stage: "Proposal",
                count: 8,
                width: "35%",
                color: "bg-amber-500",
              },
              { stage: "Won", count: 4, width: "20%", color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.stage}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {item.stage}
                  </span>
                  <span className="text-slate-500">{item.count} deals</span>
                </div>

                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <Clock3 size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Activity
            </h2>
          </div>

          <div className="space-y-6">
            {[
              "New lead added to pipeline",
              "Proposal sent to client",
              "Project marked as active",
              "Deal moved to qualified",
            ].map((activity, index) => (
              <div key={activity} className="flex gap-3">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {activity}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {index + 1} hours ago · Demo
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent leads */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent Leads</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.name} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {lead.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{lead.company}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {lead.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
