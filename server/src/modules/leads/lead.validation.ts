import { z } from 'zod'

export const leadStatusSchema = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST'
])

export const leadPrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
])

const nameSchema = z.string()
  .trim()
  .min(2, 'Name must contain at least 2 characters')
  .max(100)
  .regex(
    /^(?=.*\p{L})[\p{L}\p{M} .'-]+$/u,
    'Enter a valid full name'
  )

const phoneSchema = z.string()
  .trim()
  .max(30)
  .regex(
    /^\+?[0-9 ()-]+$/,
    'Phone number contains invalid characters'
  )
  .refine(
    value => {
      const digits = value.replace(/\D/g, '')
      return digits.length >= 7 && digits.length <= 15
    },
    'Phone number must contain 7 to 15 digits'
  )

export const createLeadSchema = z.object({
  name: nameSchema,

  email: z.string()
    .trim()
    .email('Enter a valid email address')
    .max(254)
    .transform(value => value.toLowerCase())
    .nullable()
    .optional(),

  phone: phoneSchema
    .nullable()
    .optional(),

  company: z.string()
    .trim()
    .max(150)
    .regex(/\p{L}/u, 'Enter a valid company name')
    .nullable()
    .optional(),

  source: z.string()
    .trim()
    .max(100)
    .regex(/\p{L}/u, 'Enter a valid lead source')
    .nullable()
    .optional(),

  status: leadStatusSchema.optional(),

  priority: leadPrioritySchema.optional(),

  value: z.number()
    .min(0)
    .max(9999999999.99)
    .multipleOf(0.01)
    .optional(),

  notes: z.string()
    .trim()
    .max(5000)
    .nullable()
    .optional()
}).strict()

export const updateLeadSchema = createLeadSchema
  .partial()
  .refine(
    data => Object.keys(data).length > 0,
    { message: 'At least one field must be provided' }
  )

export const leadIdSchema = z.string().uuid()

export const leadQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: leadStatusSchema.optional(),
  priority: leadPrioritySchema.optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
}).strict()

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type LeadQueryInput = z.infer<typeof leadQuerySchema>
