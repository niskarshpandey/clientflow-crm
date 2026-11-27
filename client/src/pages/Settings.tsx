import { useState } from 'react'
import { UserRound, Building2, ShieldCheck } from 'lucide-react'
import PersonalProfileForm from '../components/settings/PersonalProfileForm'
import BusinessProfileForm from '../components/settings/BusinessProfileForm'
import SecurityForm from '../components/settings/SecurityForm'

type SettingsTab = 'profile' | 'business' | 'security'

const tabs = [
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'business', label: 'Business Profile', icon: Building2 },
  { id: 'security', label: 'Security', icon: ShieldCheck }
] as const

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account, business information and security.
        </p>
      </div>

      <nav aria-label="Settings sections" className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        {tabs.map(tab => {
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div className="max-w-5xl">
        {activeTab === 'profile' && <PersonalProfileForm />}
        {activeTab === 'business' && <BusinessProfileForm />}
        {activeTab === 'security' && <SecurityForm />}
      </div>
    </div>
  )
}