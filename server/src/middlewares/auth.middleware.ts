import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authenticate(
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

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'clientflow',
      audience: 'clientflow-api'
    })

    if (
      typeof decoded === 'string' ||
      typeof decoded.sub !== 'string' ||
      typeof decoded.exp !== 'number'
    ) {
      throw new Error('Invalid token')
    }

    res.locals.userId = decoded.sub
    next()
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}
