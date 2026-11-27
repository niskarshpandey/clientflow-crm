const { test } = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')

const BASE = 'http://localhost:5000/api'

async function request(method, path, token, body) {
  const headers = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined
      ? undefined
      : JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  })

  return {
    status: response.status,
    data: await response.json()
  }
}

function check(result, expected, label) {
  assert.equal(
    result.status,
    expected,
    `${label}: HTTP ${result.status}`
  )

  console.log(`PASS: ${label}`)
}

test('Concurrent password changes and token revocation', async () => {
  const email = `security-${randomUUID()}@example.com`

  const oldPassword = `Old-${randomUUID()}!`
  const passwordA = `NewA-${randomUUID()}!`
  const passwordB = `NewB-${randomUUID()}!`

  const registered = await request(
    'POST',
    '/auth/register',
    null,
    {
      name: 'Security Regression User',
      email,
      password: oldPassword
    }
  )

  check(registered, 201, 'Security test user created')

  const login = await request(
    'POST',
    '/auth/login',
    null,
    {
      email,
      password: oldPassword
    }
  )

  check(login, 200, 'Initial login successful')

  const token = login.data.data.token

  assert.ok(token)

  check(
    await request('GET', '/auth/me', token),
    200,
    'Original token valid'
  )

  const [resultA, resultB] = await Promise.all([
    request(
      'PATCH',
      '/settings/password',
      token,
      {
        currentPassword: oldPassword,
        newPassword: passwordA,
        confirmPassword: passwordA
      }
    ),

    request(
      'PATCH',
      '/settings/password',
      token,
      {
        currentPassword: oldPassword,
        newPassword: passwordB,
        confirmPassword: passwordB
      }
    )
  ])

  console.log(
    `Concurrent results: A=${resultA.status}, B=${resultB.status}`
  )

  const successful = [resultA, resultB]
    .filter(result => result.status === 200)

  assert.equal(
    successful.length,
    1,
    'Exactly one password change must succeed'
  )

  console.log('PASS: Exactly one concurrent request succeeded')

  const winner = resultA.status === 200
    ? passwordA
    : passwordB

  const loser = resultA.status === 200
    ? passwordB
    : passwordA

  const rejected = resultA.status === 200
    ? resultB
    : resultA

  assert.ok(
    [401, 409].includes(rejected.status),
    `Unexpected rejection: HTTP ${rejected.status}`
  )

  console.log('PASS: Competing password change rejected')

  const protectedRoutes = [
    '/auth/me',
    '/settings/profile',
    '/settings/business',
    '/leads',
    '/clients',
    '/projects',
    '/tasks',
    '/dashboard/overview'
  ]

  for (const path of protectedRoutes) {
    check(
      await request('GET', path, token),
      401,
      `Old token rejected: ${path}`
    )
  }

  check(
    await request(
      'POST',
      '/auth/login',
      null,
      {
        email,
        password: oldPassword
      }
    ),
    401,
    'Old password rejected'
  )

  check(
    await request(
      'POST',
      '/auth/login',
      null,
      {
        email,
        password: loser
      }
    ),
    401,
    'Losing password rejected'
  )

  const newLogin = await request(
    'POST',
    '/auth/login',
    null,
    {
      email,
      password: winner
    }
  )

  check(newLogin, 200, 'Winning password accepted')

  const newToken = newLogin.data.data.token

  assert.ok(newToken)

  check(
    await request('GET', '/auth/me', newToken),
    200,
    'New token valid'
  )

  check(
    await request('GET', '/settings/profile', newToken),
    200,
    'Account profile preserved'
  )

  check(
    await request('GET', '/dashboard/overview', newToken),
    200,
    'Dashboard accessible after password change'
  )

  console.log('SECURITY REGRESSION COMPLETED')
})