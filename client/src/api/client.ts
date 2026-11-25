const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    })
  } catch {
    throw new ApiError(
      'Unable to connect to the server. Please try again.',
      0
    )
  }

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      result?.message || 'Something went wrong',
      response.status
    )
  }

  if (!result) {
    throw new ApiError('Invalid server response', response.status)
  }

  return result as T
}
