import { z } from 'zod'

export const clientStatusSchema = z.enum([
  'PROSPECT',
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED'
])

export const createClientSchema = z.object({
  name: z.string()
    .trim()
    .min(2)
    .max(100)
    .regex(
      /^(?=.*\p{L})[\p{L}\p{M} .'-]+$/u,
      'Enter a valid full name'
    ),

  email: z.string()
    .trim()
    .email()
    .max(254)
    .transform(value => value.toLowerCase())
    .nullable()
    .optional(),

  phone: z.string()
    .trim()
    .max(30)
    .regex(/^\+?[0-9 ()-]+$/)
    .refine(value => {
      const digits = value.replace(/\D/g, '')
      return digits.length >= 7 && digits.length <= 15
    }, 'Phone must contain 7 to 15 digits')
    .nullable()
    .optional(),

  company: z.string()
    .trim()
    .max(150)
    .regex(/\p{L}/u)
    .nullable()
    .optional(),

  website: z.string()
    .trim()
    .url()
    .max(500)
    .refine(
      value => /^https?:\/\//i.test(value),
      'Website must use HTTP or HTTPS'
    )
    .nullable()
    .optional(),

  address: z.string()
    .trim()
    .max(500)
    .nullable()
    .optional(),

  industry: z.string()
    .trim()
    .max(100)
    .regex(/\p{L}/u)
    .nullable()
    .optional(),

  status: clientStatusSchema.optional(),

  notes: z.string()
    .trim()
    .max(5000)
    .nullable()
    .optional()
}).strict()

export const updateClientSchema = createClientSchema
  .partial()
  .refine(
    data => Object.keys(data).length > 0,
    'At least one field must be provided'
  )

export const clientIdSchema = z.string().uuid()

export const convertLeadSchema = z.object({
  leadId: z.string().uuid()
}).strict()

export const clientQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: clientStatusSchema.optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
}).strict()

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ClientQueryInput = z.infer<typeof clientQuerySchema>
