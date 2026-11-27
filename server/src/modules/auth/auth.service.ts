import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prisma'

export class AuthError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }
}

function generateToken(userId: string, tokenVersion: number) {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET is not configured securely')
  }

  return jwt.sign(
    { sub: userId, tokenVersion },
    secret,
    {
      algorithm: 'HS256',
      expiresIn: '1h',
      issuer: 'clientflow',
      audience: 'clientflow-api'
    }
  )
}

export async function registerUser(data: {
  name: string
  email: string
  password: string
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12)

  try {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new AuthError(409, 'Email already registered')
    }

    throw error
  }
}

export async function loginUser(data: {
  email: string
  password: string
}) {
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new AuthError(401, 'Invalid email or password')
  }

  return {
    token: generateToken(user.id, user.tokenVersion),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
}
