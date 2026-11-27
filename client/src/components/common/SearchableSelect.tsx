import { useEffect, useRef, useState } from 'react'
import { Search, ChevronDown, Check, X } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface Props {
  value: string
  options: Option[]
  search: string
  onSearchChange: (value: string) => void
  onChange: (value: string) => void
  placeholder: string
  searchPlaceholder: string
  error?: string
}

export default function SearchableSelect({
  value,
  options,
  search,
  onSearchChange,
  onChange,
  placeholder,
  searchPlaceholder,
  error
}: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    function handleOutside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handleOutside)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('pointerdown', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const selected = options.find(item => item.value === value)

  const visibleOptions = options.filter(item =>
    item.label.toLowerCase().includes(search.trim().toLowerCase())
  )

  function choose(id: string) {
    onChange(id)
    onSearchChange('')
    setOpen(false)
    trigger.current?.focus()
  }

  return (
    <div ref={root} className="relative w-full sm:w-72">
      <button
        ref={trigger}
        type="button"
        aria-label="Filter by project"
        aria-expanded={open}
        onClick={() => {
          if (!open) onSearchChange('')
          setOpen(current => !current)
        }}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 hover:border-blue-500"
      >
        <span className="truncate">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown size={17} className="shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                autoFocus
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={search}
                maxLength={100}
                onChange={event => onSearchChange(event.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-blue-500"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear project search"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-2 p-1 text-slate-400"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => choose('')}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100"
            >
              {placeholder}
              {!value && <Check size={16} className="text-blue-600" />}
            </button>

            {error ? (
              <p role="alert" className="p-3 text-sm text-red-600">
                {error}
              </p>
            ) : visibleOptions.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-500">
                No matching projects
              </p>
            ) : (
              visibleOptions.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => choose(item.value)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-blue-50"
                >
                  <span className="truncate">{item.label}</span>
                  {value === item.value && (
                    <Check size={16} className="shrink-0 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}