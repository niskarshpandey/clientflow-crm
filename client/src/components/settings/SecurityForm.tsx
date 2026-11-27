import { useState } from 'react'
import type { FormEvent } from 'react'
import { ShieldCheck, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { settingsApi } from '../../api/settings'
import { ApiError } from '../../api/client'

const emptyForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

const fields = [
  { key: 'currentPassword', label: 'Current Password', autoComplete: 'current-password' },
  { key: 'newPassword', label: 'New Password', autoComplete: 'new-password' },
  { key: 'confirmPassword', label: 'Confirm New Password', autoComplete: 'new-password' }
] as const

export default function SecurityForm() {
  const { token, logout } = useAuth()

  const [form, setForm] = useState(emptyForm)
  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token || saving) return

    setError('')

    if (
      form.newPassword.length < 8 ||
      new TextEncoder().encode(form.newPassword).length > 72
    ) {
      setError('New password must have at least 8 characters and at most 72 bytes.')
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.currentPassword === form.newPassword) {
      setError('New password must differ from current password.')
      return
    }

    setSaving(true)

    try {
      await settingsApi.changePassword(token, form)
      setForm(emptyForm)
      logout()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }

      setError(err instanceof Error ? err.message : 'Unable to change password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
          <ShieldCheck size={28} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
          <p className="text-sm text-slate-500">Protect your account with a strong password.</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Changing your password will invalidate your existing login sessions.
        You will need to sign in again.
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {fields.map(field => (
          <label key={field.key} className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">{field.label}</span>
            <input
              type={visible ? 'text' : 'password'}
              value={form[field.key]}
              autoComplete={field.autoComplete}
              maxLength={72}
              required
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={event =>
                setForm(current => ({
                  ...current,
                  [field.key]: event.target.value
                }))
              }
            />
          </label>
        ))}

        <button
          type="button"
          onClick={() => setVisible(value => !value)}
          aria-pressed={visible}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          {visible ? 'Hide Passwords' : 'Show Passwords'}
        </button>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Password Requirements</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>At least 8 characters</li>
            <li>Maximum 72 UTF-8 bytes</li>
            <li>Different from your current password</li>
            <li>New password and confirmation must match</li>
          </ul>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <KeyRound size={17} />}
            {saving ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </section>
  )
}