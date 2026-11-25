import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import healthRouter from './routes/health.routes'
import authRouter from './modules/auth/auth.routes'
import leadRouter from './modules/leads/lead.routes'

const app = express()

app.disable('x-powered-by')

app.use(helmet())

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))

app.use(express.json({ limit: '100kb' }))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts. Try again later.'
  }
})

app.use('/api', apiLimiter)

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/leads', leadRouter)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

export default app
