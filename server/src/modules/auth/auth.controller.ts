import { Request, Response } from 'express'
import { registerSchema, loginSchema } from './auth.validation'
import { registerUser, loginUser, AuthError } from './auth.service'

function handleError(error: unknown, res: Response) {
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message
    })
    return
  }

  console.error('Authentication operation failed')

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}

export async function register(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid registration data',
        errors: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      })
      return
    }

    const user = await registerUser(result.data)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    })
  } catch (error) {
    handleError(error, res)
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid login data'
      })
      return
    }

    const data = await loginUser(result.data)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data
    })
  } catch (error) {
    handleError(error, res)
  }
}
