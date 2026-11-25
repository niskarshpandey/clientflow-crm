import { useState } from 'react'
import type { FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Client, ClientInput, ClientStatus } from '../../types/client'
import { CLIENT_STATUSES } from '../../types/client'

interface Props {
  client?: Client
  onClose: () => void
  onSave: (data: ClientInput) => Promise<void>
}

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export default function ClientForm({ client, onClose, onSave }: Props) {
  const [name, setName] = useState(client?.name ?? '')
  const [email, setEmail] = useState(client?.email ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')
  const [company, setCompany] = useState(client?.company ?? '')
  const [website, setWebsite] = useState(client?.website ?? '')
  const [address, setAddress] = useState(client?.address ?? '')
  const [industry, setIndustry] = useState(client?.industry ?? '')
  const [status, setStatus] = useState<ClientStatus>(client?.status ?? 'ACTIVE')
  const [notes, setNotes] = useState(client?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    setError('')

    if (name.trim().length < 2 || !/^(?=.*\p{L})[\p{L}\p{M} .'-]+$/u.test(name.trim())) {
      setError('Please enter a valid full name.')
      return
    }

    if (phone.trim()) {
      const digits = phone.replace(/\D/g, '')

      if (!/^\+?[0-9 ()-]+$/.test(phone.trim()) || digits.length < 7 || digits.length > 15) {
        setError('Please enter a valid phone number.')
        return
      }
    }

    if (company.trim() && !/\p{L}/u.test(company)) {
      setError('Please enter a valid company name.')
      return
    }

    if (industry.trim() && !/\p{L}/u.test(industry)) {
      setError('Please enter a valid industry.')
      return
    }

    if (website.trim()) {
      try {
        const url = new URL(website.trim())

        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        setError('Enter a valid HTTP or HTTPS website URL.')
        return
      }
    }

    setSaving(true)

    try {
      await onSave({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        company: company.trim() || null,
        website: website.trim() || null,
        address: address.trim() || null,
        industry: industry.trim() || null,
        status,
        notes: notes.trim() || null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save client')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-form-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="client-form-title" className="text-xl font-bold text-slate-900">
              {client ? 'Edit Client' : 'Add New Client'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer and business information.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close client form"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Full Name *
              <input
                required
                autoFocus
                minLength={2}
                maxLength={100}
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputClass}
                placeholder="Rahul Sharma"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email Address
              <input
                type="email"
                maxLength={254}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder="name@example.com"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Phone Number
              <input
                type="tel"
                maxLength={30}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+91 9876543210"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Company
              <input
                maxLength={150}
                value={company}
                onChange={e => setCompany(e.target.value)}
                className={inputClass}
                placeholder="Company name"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Website
              <input
                type="url"
                maxLength={500}
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className={inputClass}
                placeholder="https://example.com"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Industry
              <input
                maxLength={100}
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className={inputClass}
                placeholder="Information Technology"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Client Status
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ClientStatus)}
                className={inputClass}
              >
                {CLIENT_STATUSES.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Business Address
              <textarea
                rows={2}
                maxLength={500}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Notes
              <textarea
                rows={4}
                maxLength={5000}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={inputClass}
                placeholder="Additional customer information..."
              />
            </label>
          </fieldset>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Saving...' : client ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
