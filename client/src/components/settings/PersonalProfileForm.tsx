import { useState } from 'react'
import type { FormEvent } from 'react'
import { UserRound, Save, Loader2, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { settingsApi } from '../../api/settings'
import { ApiError } from '../../api/client'

export default function PersonalProfileForm() {
  const { user, token, updateUser, logout } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token || saving) return

    const trimmedName = name.trim()

    if (
      trimmedName.length < 2 ||
      trimmedName.length > 100 ||
      !/\p{L}/u.test(trimmedName)
    ) {
      setError('Enter a valid name between 2 and 100 characters.')
      return
    }

    setSaving(true)

    try {
      const response = await settingsApi.updateProfile(token, trimmedName)

      updateUser(response.data)
      setName(response.data.name)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }

      setError(err instanceof Error ? err.message : 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
          <UserRound size={28} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Personal Information
          </h2>
          <p className="text-sm text-slate-500">
            Manage your personal account details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Full Name</span>
          <input
            className={inputClass}
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={100}
            disabled={saving}
            autoComplete="name"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            Email Address <Lock size={14} />
          </span>

          <input
            className={`${inputClass} bg-slate-50 text-slate-500`}
            value={user?.email ?? ''}
            readOnly
          />

          <span className="text-xs text-slate-500">
            Your login email cannot currently be changed.
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Account Role</p>
            <p className="mt-1 font-semibold text-slate-800">{user?.role}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Member Since</p>
            <p className="mt-1 font-semibold text-slate-800">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN')
                : 'Not available'}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={saving || name.trim() === user?.name}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  )
}