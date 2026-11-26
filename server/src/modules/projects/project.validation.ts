import { z } from 'zod'

export const projectStatusSchema = z.enum([
  'PLANNING',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED'
])

export const projectPrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
])

const projectDateSchema = z.string()
  .datetime({ offset: true })
  .nullable()
  .optional()

const projectFields = z.object({
  name: z.string()
    .trim()
    .min(2, 'Project name must contain at least 2 characters')
    .max(150)
    .regex(/\p{L}/u, 'Enter a valid project name'),

  description: z.string()
    .trim()
    .max(5000)
    .nullable()
    .optional(),

  clientId: z.string().uuid(),

  status: projectStatusSchema.optional(),

  priority: projectPrioritySchema.optional(),

  budget: z.number()
    .min(0, 'Budget cannot be negative')
    .max(9999999999.99)
    .multipleOf(0.01)
    .optional(),

  startDate: projectDateSchema,

  dueDate: projectDateSchema
}).strict()

function validDateRange(data: {
  startDate?: string | null
  dueDate?: string | null
}) {
  if (!data.startDate || !data.dueDate) {
    return true
  }

  return new Date(data.dueDate).getTime() >=
    new Date(data.startDate).getTime()
}

export const createProjectSchema = projectFields.refine(
  validDateRange,
  {
    message: 'Due date cannot be earlier than start date',
    path: ['dueDate']
  }
)

export const updateProjectSchema = projectFields
  .partial()
  .refine(
    data => Object.keys(data).length > 0,
    'At least one field must be provided'
  )
  .refine(
    validDateRange,
    {
      message: 'Due date cannot be earlier than start date',
      path: ['dueDate']
    }
  )

export const projectIdSchema = z.string().uuid()

export const projectQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),

  status: projectStatusSchema.optional(),

  priority: projectPrioritySchema.optional(),

  clientId: z.string().uuid().optional(),

  page: z.coerce.number()
    .int()
    .min(1)
    .max(100000)
    .default(1),

  limit: z.coerce.number()
    .int()
    .min(1)
    .max(100)
    .default(10)
}).strict()

export type CreateProjectInput = z.infer<
  typeof createProjectSchema
>

export type UpdateProjectInput = z.infer<
  typeof updateProjectSchema
>

export type ProjectQueryInput = z.infer<
  typeof projectQuerySchema
>
