export interface PersonalProfile {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface BusinessProfileInput {
  companyName: string | null
  businessEmail: string | null
  phone: string | null
  website: string | null
  industry: string | null
  address: string | null
}

export interface BusinessProfile extends BusinessProfileInput {
  id: string
  createdAt: string
  updatedAt: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}