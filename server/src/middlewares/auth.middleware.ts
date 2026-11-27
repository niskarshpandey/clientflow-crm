import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma'

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    })
    return
  }

  const token = authorization.slice(7)
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    res.status(500).json({
      success: false,
      message: 'Authentication configuration error'
    })
    return
  }

  let decoded: jwt.JwtPayload

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'clientflow',
      audience: 'clientflow-api'
    })

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !payload.sub ||
      typeof payload.exp !== 'number' ||
      typeof payload.tokenVersion !== 'number' ||
      !Number.isSafeInteger(payload.tokenVersion) ||
      payload.tokenVersion < 0
    ) {
      throw new Error('Invalid token')
    }

    decoded = payload
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please sign in again.'
    })
    return
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.sub
      },
      select: {
        id: true,
        tokenVersion: true
      }
    })

    if (
      !user ||
      user.tokenVersion !== decoded.tokenVersion
    ) {
      res.status(401).json({
        success: false,
        message: 'Session expired. Please sign in again.'
      })
      return
    }

    res.locals.userId = user.id
    res.locals.tokenVersion = user.tokenVersion

    next()
  } catch {
    console.error('Authentication database check failed')

    res.status(500).json({
      success: false,
      message: 'Unable to verify authentication'
    })
  }
}
