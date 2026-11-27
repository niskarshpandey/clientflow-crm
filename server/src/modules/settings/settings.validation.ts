import { z } from 'zod'

const optionalText = (max: number) =>
  z.string().trim().max(max).nullable().optional()

const passwordSchema = z.string()
  .min(8)
  .max(72)
  .refine(
    value => Buffer.byteLength(value, 'utf8') <= 72,
    {
      message: 'Password must not exceed 72 bytes'
    }
  )

export const updateProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(2)
    .max(100)
    .regex(/\p{L}/u, 'Name must contain a letter')
}).strict()

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1)
    .max(72)
    .refine(value =>
      Buffer.byteLength(value, 'utf8') <= 72
    ),

  newPassword: passwordSchema,

  confirmPassword: passwordSchema
})
.strict()
.refine(
  data => data.newPassword === data.confirmPassword,
  {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  }
)
.refine(
  data => data.currentPassword !== data.newPassword,
  {
    path: ['newPassword'],
    message: 'New password must differ from current password'
  }
)

export const updateBusinessProfileSchema = z.object({
  companyName: optionalText(150),

  businessEmail: z.string()
    .trim()
    .email()
    .max(254)
    .transform(value => value.toLowerCase())
    .nullable()
    .optional(),

  phone: z.string()
    .trim()
    .max(30)
    .regex(/^[0-9+().\s-]+$/, 'Invalid phone number')
    .nullable()
    .optional(),

  website: z.string()
    .trim()
    .max(500)
    .url()
    .refine(
      value => /^https?:\/\//i.test(value),
      'Website must use HTTP or HTTPS'
    )
    .nullable()
    .optional(),

  industry: optionalText(100),

  address: optionalText(1000)
})
.strict()
.refine(
  data => Object.keys(data).length > 0,
  {
    message: 'At least one business field is required'
  }
)

export type UpdateProfileInput =
  z.infer<typeof updateProfileSchema>

export type ChangePasswordInput =
  z.infer<typeof changePasswordSchema>

export type UpdateBusinessProfileInput =
  z.infer<typeof updateBusinessProfileSchema>
