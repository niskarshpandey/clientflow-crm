import { useState } from 'react'
import type { FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'

import {
  LEAD_STATUSES,
  LEAD_PRIORITIES
} from '../../types/lead'

import type {
  Lead,
  LeadInput,
  LeadStatus,
  LeadPriority
} from '../../types/lead'

interface Props {
  lead?: Lead
  onClose: () => void
  onSave: (data: LeadInput) => Promise<void>
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

export default function LeadForm({
  lead,
  onClose,
  onSave
}: Props) {
  const [name, setName] = useState(lead?.name ?? '')
  const [email, setEmail] = useState(lead?.email ?? '')
  const [phone, setPhone] = useState(lead?.phone ?? '')
  const [company, setCompany] = useState(lead?.company ?? '')
  const [source, setSource] = useState(lead?.source ?? '')
  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? 'NEW')
  const [priority, setPriority] = useState<LeadPriority>(lead?.priority ?? 'MEDIUM')
  const [value, setValue] = useState(lead?.value ?? '0')
  const [notes, setNotes] = useState(lead?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (saving) return

    if (!/^(?=.*\p{L})[\p{L}\p{M} .'-]+$/u.test(name.trim())) {
      setError('Please enter a valid full name.')
      return
    }

    if (phone.trim()) {
      const digits = phone.replace(/\D/g, '')

      if (
        !/^\+?[0-9 ()-]+$/.test(phone.trim()) ||
        digits.length < 7 ||
        digits.length > 15
      ) {
        setError('Please enter a valid phone number with 7 to 15 digits.')
        return
      }
    }

    if (company.trim() && !/\p{L}/u.test(company)) {
      setError('Please enter a valid company name.')
      return
    }

    if (source.trim() && !/\p{L}/u.test(source)) {
      setError('Please enter a valid lead source.')
      return
    }

    setError('')

    if (name.trim().length < 2) {
      setError('Name must contain at least 2 characters.')
      return
    }

    if (!/^\d+(\.\d{1,2})?$/.test(value) ||
        Number(value) > 9999999999.99) {
      setError('Enter a valid deal value.')
      return
    }

    setSaving(true)

    try {
      await onSave({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        company: company.trim() || null,
        source: source.trim() || null,
        status,
        priority,
        value: Number(value),
        notes: notes.trim() || null
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save lead'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 id="lead-form-title" className="text-xl font-bold text-slate-900">
              {lead ? 'Edit Lead' : 'Create New Lead'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your business opportunity details.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close form"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Full Name *
              <input
                autoFocus
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium">
              Email
              <input
                type="email"
                maxLength={254}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium">
              Phone
              <input
                type="tel"
                minLength={5}
                maxLength={30}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium">
              Company
              <input
                maxLength={150}
                value={company}
                onChange={e => setCompany(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium">
              Lead Source
              <input
                maxLength={100}
                placeholder="LinkedIn, Website, Referral..."
                value={source}
                onChange={e => setSource(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium">
              Deal Value (INR)
              <input
                type="number"
                required
                min="0"
                max="9999999999.99"
                step="0.01"
                value={value}
                onChange={e => setValue(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium">
              Status
              <select
                value={status}
                onChange={e => setStatus(e.target.value as LeadStatus)}
                className={inputClass}
              >
                {LEAD_STATUSES.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium">
              Priority
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as LeadPriority)}
                className={inputClass}
              >
                {LEAD_PRIORITIES.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium">
            Notes
            <textarea
              rows={4}
              maxLength={5000}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className={inputClass}
            />
          </label>

          <footer className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Saving...' : lead ? 'Save Changes' : 'Create Lead'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
