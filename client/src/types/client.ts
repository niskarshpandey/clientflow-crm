export type ClientStatus =
  | 'PROSPECT'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED'

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  website: string | null
  address: string | null
  industry: string | null
  status: ClientStatus
  notes: string | null
  ownerId: string
  leadId: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientInput {
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  website?: string | null
  address?: string | null
  industry?: string | null
  status?: ClientStatus
  notes?: string | null
}

export interface ClientFilters {
  search?: string
  status?: ClientStatus
  page?: number
  limit?: number
}

export interface ClientPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ClientListResponse {
  success: boolean
  data: Client[]
  pagination: ClientPagination
}

export const CLIENT_STATUSES: ClientStatus[] = [
  'PROSPECT',
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED'
]
