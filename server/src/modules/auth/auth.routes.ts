import { Router } from 'express'
import { register, login } from './auth.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { prisma } from '../../config/prisma'

const router = Router()

router.post('/register', register)
router.post('/login', login)

router.get('/me', authenticate, async (_req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: res.locals.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      })
      return
    }

    res.json({
      success: true,
      data: user
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router
