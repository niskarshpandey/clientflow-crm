import { prisma } from './config/prisma'

async function main() {
  try {
    await prisma.$connect()
    console.log('Database connected successfully')

    const count = await prisma.user.count()
    console.log('Total users:', count)
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
