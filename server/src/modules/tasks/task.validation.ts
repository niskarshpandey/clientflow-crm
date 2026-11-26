import { z } from 'zod'

export const taskStatusSchema = z.enum([
  'TO_DO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'COMPLETED',
  'CANCELLED'
])

export const taskPrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
])

const hoursSchema = z
  .number()
  .min(0, 'Hours cannot be negative')
  .max(999999.99, 'Hours exceed the allowed limit')
  .multipleOf(0.01, 'Hours can have up to two decimal places')

const dateSchema = z
  .string()
  .datetime({ offset: true })
  .nullable()
  .optional()

const taskBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Task title must contain at least 2 characters')
    .max(150, 'Task title cannot exceed 150 characters')
    .refine(value => /\p{L}/u.test(value), {
      message: 'Task title must contain at least one letter'
    }),

  description: z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional(),

  projectId: z.string().uuid(),

  status: taskStatusSchema.optional(),

  priority: taskPrioritySchema.optional(),

  startDate: dateSchema,

  dueDate: dateSchema,

  estimatedHours: hoursSchema.nullable().optional(),

  actualHours: hoursSchema.nullable().optional()
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

export const createTaskSchema = taskBaseSchema.refine(
  validDateRange,
  {
    message: 'Due date cannot be earlier than start date',
    path: ['dueDate']
  }
)

export const updateTaskSchema = taskBaseSchema
  .partial()
  .refine(
    data => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided'
    }
  )
  .refine(
    validDateRange,
    {
      message: 'Due date cannot be earlier than start date',
      path: ['dueDate']
    }
  )

export const taskIdSchema = z.string().uuid()

export const taskQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),

  status: taskStatusSchema.optional(),

  priority: taskPrioritySchema.optional(),

  projectId: z.string().uuid().optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(100000)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
}).strict()

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export type TaskQuery = z.infer<typeof taskQuerySchema>
