import bcrypt from 'bcryptjs'
import { prisma } from '../../config/prisma'

import type {
  UpdateProfileInput,
  ChangePasswordInput,
  UpdateBusinessProfileInput
} from './settings.validation'

export class SettingsError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
  }
}

const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true
} as const

const businessSelect = {
  id: true,
  companyName: true,
  businessEmail: true,
  phone: true,
  website: true,
  industry: true,
  address: true,
  createdAt: true,
  updatedAt: true
} as const

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect
  })

  if (!user) {
    throw new SettingsError(404, 'User not found')
  }

  return user
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileInput
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name
    },
    select: profileSelect
  })
}

export async function changePassword(
  userId: string,
  authenticatedVersion: number,
  data: ChangePasswordInput
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      password: true,
      tokenVersion: true
    }
  })

  if (!user) {
    throw new SettingsError(404, 'User not found')
  }

  if (user.tokenVersion !== authenticatedVersion) {
    throw new SettingsError(
      401,
      'Session expired. Please sign in again.'
    )
  }

  const validPassword = await bcrypt.compare(
    data.currentPassword,
    user.password
  )

  if (!validPassword) {
    throw new SettingsError(
      400,
      'Current password is incorrect'
    )
  }

  const hashedPassword = await bcrypt.hash(
    data.newPassword,
    12
  )

  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      tokenVersion: authenticatedVersion,
      password: user.password
    },
    data: {
      password: hashedPassword,
      tokenVersion: {
        increment: 1
      }
    }
  })

  if (result.count !== 1) {
    throw new SettingsError(
      409,
      'Account security changed. Please sign in again.'
    )
  }

  return {
    message: 'Password changed successfully. Please sign in again.'
  }
}

export async function getBusinessProfile(
  userId: string
) {
  return prisma.businessProfile.findUnique({
    where: { userId },
    select: businessSelect
  })
}

export async function updateBusinessProfile(
  userId: string,
  data: UpdateBusinessProfileInput
) {
  return prisma.businessProfile.upsert({
    where: { userId },
    create: {
      ...data,
      userId
    },
    update: data,
    select: businessSelect
  })
}
