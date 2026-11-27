import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Building2, Save, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { settingsApi } from '../../api/settings'
import { ApiError } from '../../api/client'
import type { BusinessProfileInput } from '../../types/settings'

const emptyForm = {
  companyName: '',
  businessEmail: '',
  phone: '',
  website: '',
  industry: '',
  address: ''
}

const fields = [
  { key: 'companyName', label: 'Company Name', type: 'text', max: 150 },
  { key: 'businessEmail', label: 'Business Email', type: 'email', max: 254 },
  { key: 'phone', label: 'Phone Number', type: 'tel', max: 30 },
  { key: 'website', label: 'Website', type: 'url', max: 500 },
  { key: 'industry', label: 'Industry', type: 'text', max: 100 }
] as const

export default function BusinessProfileForm() {
  const { token, logout } = useAuth()

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!token) return

    let active = true

    settingsApi.getBusinessProfile(token)
      .then(response => {
        if (!active) return

        const data = response.data

        setForm({
          companyName: data?.companyName ?? '',
          businessEmail: data?.businessEmail ?? '',
          phone: data?.phone ?? '',
          website: data?.website ?? '',
          industry: data?.industry ?? '',
          address: data?.address ?? ''
        })

        setLoadFailed(false)
      })
      .catch(err => {
        if (!active) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setLoadFailed(true)
        setError(err instanceof Error ? err.message : 'Unable to load business profile.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, revision, logout])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token || saving || loading || loadFailed) return

    setError('')
    setSuccess('')

    const data: BusinessProfileInput = {
      companyName: form.companyName.trim() || null,
      businessEmail: form.businessEmail.trim() || null,
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      industry: form.industry.trim() || null,
      address: form.address.trim() || null
    }

    if (data.website && !/^https?:\/\//i.test(data.website)) {
      setError('Website must start with http:// or https://.')
      return
    }

    if (data.phone && !/^[0-9+().\s-]+$/.test(data.phone)) {
      setError('Enter a valid phone number.')
      return
    }

    setSaving(true)

    try {
      const response = await settingsApi.updateBusinessProfile(token, data)
      const saved = response.data

      setForm({
        companyName: saved.companyName ?? '',
        businessEmail: saved.businessEmail ?? '',
        phone: saved.phone ?? '',
        website: saved.website ?? '',
        industry: saved.industry ?? '',
        address: saved.address ?? ''
      })

      setSuccess('Business profile saved successfully.')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }

      setError(err instanceof Error ? err.message : 'Unable to save business profile.')
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
          <Building2 size={28} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">Business Information</h2>
          <p className="text-sm text-slate-500">Manage your company profile and contact details.</p>
        </div>
      </div>

      {loading ? (
        <div role="status" className="flex items-center justify-center gap-3 py-12 text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading business profile...
        </div>
      ) : loadFailed ? (
        <div className="space-y-4 py-6">
          <p role="alert" className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setError('')
              setRevision(value => value + 1)
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white"
          >
            Try Again
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {success && (
            <div role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {fields.map(field => (
              <label key={field.key} className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">{field.label}</span>
                <input
                  type={field.type}
                  value={form[field.key]}
                  maxLength={field.max}
                  disabled={saving}
                  className={inputClass}
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      [field.key]: event.target.value
                    }))
                  }
                />
              </label>
            ))}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Business Address</span>
            <textarea
              value={form.address}
              maxLength={1000}
              rows={4}
              disabled={saving}
              className={inputClass}
              onChange={event =>
                setForm(current => ({ ...current, address: event.target.value }))
              }
            />
          </label>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? 'Saving...' : 'Save Business Profile'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}