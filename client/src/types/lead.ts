export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'

export type LeadPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT'

export interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  source: string | null
  status: LeadStatus
  priority: LeadPriority
  value: string
  notes: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface LeadInput {
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  source?: string | null
  status?: LeadStatus
  priority?: LeadPriority
  value?: number
  notes?: string | null
}

export interface LeadFilters {
  search?: string
  status?: LeadStatus
  priority?: LeadPriority
  page?: number
  limit?: number
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LeadListResponse {
  success: boolean
  data: Lead[]
  pagination: Pagination
}

export const LEAD_STATUSES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST'
]

export const LEAD_PRIORITIES: LeadPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
]
