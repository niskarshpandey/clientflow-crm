import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(8).max(72)
    .refine(v => Buffer.byteLength(v, 'utf8') <= 72, {
      message: 'Password must not exceed 72 bytes'
    })
}).strict()

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(1).max(72)
    .refine(v => Buffer.byteLength(v, 'utf8') <= 72)
}).strict()
