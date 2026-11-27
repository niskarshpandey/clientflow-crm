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

  const text = await response.text()

  let data

  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }

  return {
    status: response.status,
    data
  }
}

function expectStatus(result, expected, label) {
  assert.equal(
    result.status,
    expected,
    `${label}: ${JSON.stringify(result.data)}`
  )

  console.log(`PASS: ${label}`)
}

async function createUser() {
  const email = `day15-${randomUUID()}@example.com`
  const password = `Test-${randomUUID()}!`

  const registered = await request(
    'POST',
    '/auth/register',
    null,
    {
      name: 'Regression Test User',
      email,
      password
    }
  )

  expectStatus(registered, 201, 'Test user registered')

  const login = await request(
    'POST',
    '/auth/login',
    null,
    { email, password }
  )

  expectStatus(login, 200, 'Test user authenticated')

  assert.ok(login.data.data.token)

  return {
    email,
    password,
    token: login.data.data.token
  }
}

test('Lead validation and account isolation', async () => {
  const userA = await createUser()
  const userB = await createUser()

  const cleanup = []

  try {
    expectStatus(
      await request('GET', '/leads'),
      401,
      'Unauthenticated lead access rejected'
    )

    expectStatus(
      await request('GET', '/leads', 'invalid-token'),
      401,
      'Invalid token rejected'
    )

    const invalidInputs = [
      ['Missing name', {}],
      ['Empty name', { name: '' }],
      ['Single character name', { name: 'A' }],
      ['Numeric name', { name: '12345' }],
      ['Invalid name characters', { name: 'Test@User' }],
      ['Name too long', { name: 'A'.repeat(101) }],
      ['Invalid email', { email: 'invalid-email' }],
      ['Invalid phone characters', { phone: 'abc1234567' }],
      ['Phone too short', { phone: '12345' }],
      ['Phone too long', { phone: '1234567890123456' }],
      ['Invalid company', { company: '12345' }],
      ['Invalid source', { source: '12345' }],
      ['Invalid status', { status: 'INVALID' }],
      ['Invalid priority', { priority: 'INVALID' }],
      ['Negative value', { value: -100 }],
      ['Excessive value', { value: 10000000000 }],
      ['Excess decimal precision', { value: 100.123 }],
      ['String value', { value: '5000' }],
      ['Notes too long', { notes: 'A'.repeat(5001) }],
      ['Unknown field', { unknownField: true }],
      ['Owner injection', { ownerId: randomUUID() }]
    ]

    for (const [label, input] of invalidInputs) {
      const body = label === 'Missing name'
        ? input
        : { name: 'Valid Test Lead', ...input }

      const result = await request(
        'POST',
        '/leads',
        userA.token,
        body
      )

      if (result.status === 201 && result.data?.data?.id) {
        cleanup.push(result.data.data.id)
      }

      expectStatus(result, 400, label)
    }

    const created = await request(
      'POST',
      '/leads',
      userA.token,
      {
        name: '  Regression Test Lead  ',
        email: '  TEST@EXAMPLE.COM  ',
        phone: '+91 9876543210',
        company: 'Test Company',
        source: 'Website',
        status: 'NEW',
        priority: 'HIGH',
        value: 15000.50,
        notes: 'Automated regression test'
      }
    )

    if (created.data?.data?.id) {
      cleanup.push(created.data.data.id)
    }

    expectStatus(created, 201, 'Valid lead created')

    const lead = created.data.data

    assert.equal(lead.name, 'Regression Test Lead')
    assert.equal(lead.email, 'test@example.com')
    assert.equal(Number(lead.value), 15000.50)

    console.log('PASS: Name and email normalization')
    console.log('PASS: Decimal value preserved')

    const path = `/leads/${lead.id}`

    const invalidQueries = [
      'page=0',
      'page=-1',
      'page=1.5',
      'page=100001',
      'limit=0',
      'limit=101',
      'status=INVALID',
      'priority=INVALID',
      'unknown=true',
      `search=${'A'.repeat(101)}`
    ]

    for (const query of invalidQueries) {
      expectStatus(
        await request(
          'GET',
          `/leads?${query}`,
          userA.token
        ),
        400,
        `Invalid query rejected: ${query}`
      )
    }

    expectStatus(
      await request('PATCH', path, userA.token, {}),
      400,
      'Empty update rejected'
    )

    expectStatus(
      await request('PATCH', path, userA.token, {
        value: -500
      }),
      400,
      'Invalid update rejected'
    )

    expectStatus(
      await request('PATCH', path, userA.token, {
        ownerId: randomUUID()
      }),
      400,
      'Owner modification rejected'
    )

    expectStatus(
      await request('GET', '/leads/invalid-id', userA.token),
      400,
      'Invalid UUID rejected'
    )

    expectStatus(
      await request('GET', path, userB.token),
      404,
      'Cross-user lead read blocked'
    )

    expectStatus(
      await request('PATCH', path, userB.token, {
        name: 'Unauthorized Change'
      }),
      404,
      'Cross-user lead update blocked'
    )

    expectStatus(
      await request('DELETE', path, userB.token),
      404,
      'Cross-user lead deletion blocked'
    )

    const otherList = await request(
      'GET',
      '/leads',
      userB.token
    )

    expectStatus(otherList, 200, 'Second account list accessible')

    assert.equal(otherList.data.pagination.total, 0)

    console.log('PASS: Cross-user list isolation')

    const updated = await request(
      'PATCH',
      path,
      userA.token,
      {
        status: 'QUALIFIED',
        priority: 'URGENT',
        value: 25000
      }
    )

    expectStatus(updated, 200, 'Valid update accepted')

    const saved = await request('GET', path, userA.token)

    expectStatus(saved, 200, 'Updated lead retrieved')

    assert.equal(saved.data.data.status, 'QUALIFIED')
    assert.equal(saved.data.data.priority, 'URGENT')
    assert.equal(Number(saved.data.data.value), 25000)

    console.log('PASS: Updated values persisted')

    const filtered = await request(
      'GET',
      '/leads?status=QUALIFIED&priority=URGENT',
      userA.token
    )

    expectStatus(filtered, 200, 'Combined filters accepted')

    assert.equal(filtered.data.pagination.total, 1)
    assert.equal(filtered.data.data[0].id, lead.id)

    console.log('PASS: Combined filter accuracy')

  } finally {
    for (const id of cleanup.reverse()) {
      const result = await request(
        'DELETE',
        `/leads/${id}`,
        userA.token
      )

      console.log(`CLEANUP: ${id} - HTTP ${result.status}`)

      assert.ok(
        [200, 204, 404].includes(result.status),
        'Test record cleanup failed'
      )
    }
  }
})