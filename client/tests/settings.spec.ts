import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'

test('Settings account and business management', async ({ page, request }) => {
  test.setTimeout(120000)

  const api = 'http://localhost:5000/api'
  const frontend = 'http://localhost:5173'

  const email = `settings-browser-${randomUUID()}@example.com`
  const oldPassword = `Aa1!${randomUUID()}`
  const newPassword = `Bb2!${randomUUID()}`

  const browserErrors: string[] = []

  page.on('pageerror', error => {
    browserErrors.push(error.message)
  })

  const registration = await request.post(`${api}/auth/register`, {
    data: {
      name: 'Settings Browser User',
      email,
      password: oldPassword
    }
  })

  expect(registration.status()).toBe(201)

  const login = await request.post(`${api}/auth/login`, {
    data: { email, password: oldPassword }
  })

  expect(login.status()).toBe(200)

  const loginData = await login.json()
  const token = loginData.data.token

  await page.addInitScript(({ token }) => {
    if (!sessionStorage.getItem('settings_test_initialized')) {
      sessionStorage.setItem('clientflow_token', token)
      sessionStorage.setItem('settings_test_initialized', 'true')
    }
  }, { token })

  await page.goto(`${frontend}/settings`)

  await expect(
    page.getByRole('heading', { name: 'Settings', exact: true })
  ).toBeVisible()

  console.log('[PASS] Settings page opens')

  await expect(
    page.getByRole('heading', { name: 'Personal Information' })
  ).toBeVisible()

  console.log('[PASS] Personal profile displayed')

  await expect(page.getByLabel('Full Name', { exact: true }))
    .toHaveValue('Settings Browser User')

  console.log('[PASS] Existing name loaded')

  await expect(page.getByLabel(/Email Address/))
    .toHaveValue(email)

  await expect(page.getByLabel(/Email Address/))
    .toHaveAttribute('readonly', '')

  console.log('[PASS] Login email is read-only')

  await expect(
    page.getByRole('button', { name: 'Save Changes', exact: true })
  ).toBeDisabled()

  console.log('[PASS] Unchanged profile cannot be submitted')

  await page.getByLabel('Full Name', { exact: true }).fill('A')

  await page.getByRole('button', { name: 'Save Changes', exact: true }).click()

  await expect(page.getByRole('alert'))
    .toContainText('Enter a valid name')

  console.log('[PASS] Invalid name rejected')

  await page.getByLabel('Full Name', { exact: true })
    .fill('Updated Browser User')

  await page.getByRole('button', { name: 'Save Changes', exact: true }).click()

  await expect(page.getByRole('status'))
    .toContainText('Profile updated successfully')

  console.log('[PASS] Personal profile updated')

  const profile = await request.get(`${api}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  expect(profile.status()).toBe(200)
  expect((await profile.json()).data.name).toBe('Updated Browser User')

  console.log('[PASS] Updated profile persisted in database')

  await page.reload()

  await expect(page.getByLabel('Full Name', { exact: true }))
    .toHaveValue('Updated Browser User')

  console.log('[PASS] Updated name survives page reload')

  await page.getByRole('button', { name: 'Business Profile', exact: true }).click()

  await expect(
    page.getByRole('heading', { name: 'Business Information' })
  ).toBeVisible()

  await expect(page.getByLabel('Company Name', { exact: true }))
    .toHaveValue('')

  console.log('[PASS] Empty business profile loaded')

  await page.getByLabel('Company Name', { exact: true })
    .fill('ClientFlow Browser Agency')

  await page.getByLabel('Business Email', { exact: true })
    .fill('agency@example.com')

  await page.getByLabel('Phone Number', { exact: true })
    .fill('+91 9876543210')

  await page.getByLabel('Website', { exact: true })
    .fill('https://example.com')

  await page.getByLabel('Industry', { exact: true })
    .fill('Software Development')

  await page.getByLabel('Business Address', { exact: true })
    .fill('Test Business Address')

  await page.getByRole('button', { name: 'Save Business Profile' }).click()

  await expect(page.getByRole('status'))
    .toContainText('Business profile saved successfully')

  console.log('[PASS] Business profile saved')

  await page.getByRole('button', { name: 'My Profile', exact: true }).click()
  await page.getByRole('button', { name: 'Business Profile', exact: true }).click()

  await expect(page.getByLabel('Company Name', { exact: true }))
    .toHaveValue('ClientFlow Browser Agency')

  await expect(page.getByLabel('Industry', { exact: true }))
    .toHaveValue('Software Development')

  console.log('[PASS] Business information persists after tab switch')

  await page.getByLabel('Phone Number', { exact: true }).fill('')

  await page.getByRole('button', { name: 'Save Business Profile' }).click()

  await expect(page.getByRole('status'))
    .toContainText('Business profile saved successfully')

  const business = await request.get(`${api}/settings/business`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  expect(business.status()).toBe(200)
  expect((await business.json()).data.phone).toBeNull()

  console.log('[PASS] Optional business field cleared')

  await page.getByRole('button', { name: 'Security', exact: true }).click()

  await expect(
    page.getByRole('heading', { name: 'Change Password', exact: true })
  ).toBeVisible()

  console.log('[PASS] Security section displayed')

  const current = page.getByLabel('Current Password', { exact: true })
  const next = page.getByLabel('New Password', { exact: true })
  const confirm = page.getByLabel('Confirm New Password', { exact: true })

  await expect(current).toHaveAttribute('type', 'password')

  await page.getByRole('button', { name: 'Show Passwords' }).click()
  await expect(current).toHaveAttribute('type', 'text')

  await page.getByRole('button', { name: 'Hide Passwords' }).click()
  await expect(current).toHaveAttribute('type', 'password')

  console.log('[PASS] Password visibility toggle works')

  await current.fill(oldPassword)
  await next.fill(newPassword)
  await confirm.fill('DifferentPassword123!')

  await page.getByRole('button', { name: 'Change Password', exact: true }).click()

  await expect(page.getByRole('alert')).toContainText('Passwords do not match')

  console.log('[PASS] Password confirmation validated')

  await current.fill('WrongPassword123!')
  await confirm.fill(newPassword)

  await page.getByRole('button', { name: 'Change Password', exact: true }).click()

  await expect(page.getByRole('alert'))
    .toContainText('Current password is incorrect')

  console.log('[PASS] Incorrect current password rejected')

  await current.fill(oldPassword)

  await page.getByRole('button', { name: 'Change Password', exact: true }).click()

  await expect(page).toHaveURL(/\/login$/)

  expect(
    await page.evaluate(() => sessionStorage.getItem('clientflow_token'))
  ).toBeNull()

  console.log('[PASS] Password change triggers automatic logout')

  const expiredSession = await request.get(`${api}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  expect(expiredSession.status()).toBe(401)

  console.log('[PASS] Previous JWT invalidated')

  const oldLogin = await request.post(`${api}/auth/login`, {
    data: { email, password: oldPassword }
  })

  expect(oldLogin.status()).toBe(401)

  console.log('[PASS] Old password rejected')

  const newLogin = await request.post(`${api}/auth/login`, {
    data: { email, password: newPassword }
  })

  expect(newLogin.status()).toBe(200)

  console.log('[PASS] New password accepted')

  const newLoginData = await newLogin.json()
  const newToken = newLoginData.data.token

  await page.evaluate(token => {
    sessionStorage.setItem('clientflow_token', token)
  }, newToken)

  await page.goto(`${frontend}/settings`)

  await expect(page.getByLabel('Full Name', { exact: true }))
    .toHaveValue('Updated Browser User')

  await page.getByRole('button', { name: 'Business Profile', exact: true }).click()

  await expect(page.getByLabel('Company Name', { exact: true }))
    .toHaveValue('ClientFlow Browser Agency')

  console.log('[PASS] Account data preserved after password change')

  await page.screenshot({
    path: 'test-results/settings-verified.png',
    fullPage: true
  })

  expect(browserErrors).toEqual([])

  console.log('[PASS] No uncaught browser errors')
  console.log('ALL SETTINGS BROWSER CHECKS PASSED')
})