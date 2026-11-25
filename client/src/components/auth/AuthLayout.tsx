import type { ReactNode } from 'react'
import {
  Layers,
  Users,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Manage your relationships',
    description: 'Keep all your leads and clients in one place.'
  },
  {
    icon: TrendingUp,
    title: 'Grow your business',
    description: 'Track opportunities and improve conversions.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure workspace',
    description: 'Access your business through authenticated accounts.'
  }
]

export default function AuthLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-3">
            <Layers size={26} />
          </div>
          <span className="text-2xl font-bold">
            ClientFlow
          </span>
        </div>

        <div className="relative max-w-lg">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            <CheckCircle2 size={16} />
            Your business, simplified
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Build relationships.
            <span className="block text-blue-400">
              Drive growth.
            </span>
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            One powerful workspace to manage clients,
            leads, projects and business operations.
          </p>

          <div className="mt-10 space-y-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-slate-500">
          Copyright {new Date().getFullYear()} ClientFlow.
          All rights reserved.
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-blue-600 p-3 text-white">
              <Layers size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              ClientFlow
            </span>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
