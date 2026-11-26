import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'

test('ClientFlow Dashboard automated verification', async ({ page, request }) => {
  test.setTimeout(120000)

  const api = 'http://localhost:5000/api'
  const frontend = 'http://localhost:5173'

  const email = `browser-test-${randomUUID()}@example.com`
  const password = randomUUID() + 'Aa1!'

  const records: { path: string; id: string }[] = []
  const browserErrors: string[] = []

  let token = ''

  page.on('pageerror', error => {
    browserErrors.push(error.message)
  })

  function passed(name: string) {
    console.log(`PASS: ${name}`)
  }

  async function createRecord(path: string, data: object) {
    const response = await request.post(`${api}/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data
    })

    expect(response.ok()).toBeTruthy()

    const body = await response.json()

    records.push({
      path,
      id: body.data.id
    })

    return body.data
  }

  async function checkKpi(title: string, value: string) {
    const card = page.locator('div.rounded-2xl').filter({
      has: page.getByText(title, { exact: true })
    })

    await expect(card.getByText(value, { exact: true })).toBeVisible()

    passed(`${title} = ${value}`)
  }

  try {
    const health = await request.get(`${api}/health`)

    expect(health.ok()).toBeTruthy()

    passed('Backend health')

    const register = await request.post(`${api}/auth/register`, {
      data: {
        name: 'Dashboard Browser Test',
        email,
        password
      }
    })

    expect(register.ok()).toBeTruthy()

    passed('Temporary user registration')

    const login = await request.post(`${api}/auth/login`, {
      data: { email, password }
    })

    expect(login.ok()).toBeTruthy()

    token = (await login.json()).data.token

    expect(token).toBeTruthy()

    passed('Authentication API')

    await page.addInitScript(({ token }) => {
      sessionStorage.setItem('clientflow_token', token)
    }, { token })

    await page.goto(`${frontend}/dashboard`)

    await expect(
      page.getByRole('heading', {
        name: 'Dashboard',
        exact: true
      })
    ).toBeVisible()

    passed('Dashboard opens')

    await checkKpi('Total Leads', '0')
    await checkKpi('Active Clients', '0')
    await checkKpi('Active Projects', '0')
    await checkKpi('Total Tasks', '0')

    await expect(
      page.getByText('No leads available yet.', { exact: true })
    ).toBeVisible()

    await expect(
      page.getByText('No projects available yet.', { exact: true })
    ).toBeVisible()

    await expect(
      page.getByText('No tasks available yet.', { exact: true })
    ).toBeVisible()

    await expect(
      page.getByText('No upcoming deadlines.', { exact: true })
    ).toBeVisible()

    passed('Empty dashboard states')

    await createRecord('leads', {
      name: 'Browser Test New Lead',
      status: 'NEW',
      value: 10000
    })

    await createRecord('leads', {
      name: 'Browser Test Won Lead',
      status: 'WON',
      value: 20000
    })

    await createRecord('leads', {
      name: 'Browser Test Lost Lead',
      status: 'LOST',
      value: 5000
    })

    const client = await createRecord('clients', {
      name: 'Browser Test Client',
      company: 'Browser Test Company',
      status: 'ACTIVE'
    })

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const future = new Date(today)
    future.setUTCDate(future.getUTCDate() + 3)

    const past = new Date(today)
    past.setUTCDate(past.getUTCDate() - 2)

    const project = await createRecord('projects', {
      name: 'Browser Test Project',
      clientId: client.id,
      status: 'IN_PROGRESS',
      budget: 50000,
      dueDate: future.toISOString()
    })

    await createRecord('tasks', {
      title: 'Browser Completed Task',
      projectId: project.id,
      status: 'COMPLETED',
      dueDate: past.toISOString()
    })

    await createRecord('tasks', {
      title: 'Browser Overdue Task',
      projectId: project.id,
      status: 'TO_DO',
      dueDate: past.toISOString()
    })

    await createRecord('tasks', {
      title: 'Browser Upcoming Task',
      projectId: project.id,
      status: 'IN_PROGRESS',
      dueDate: future.toISOString()
    })

    await createRecord('tasks', {
      title: 'Browser Cancelled Task',
      projectId: project.id,
      status: 'CANCELLED',
      dueDate: past.toISOString()
    })

    passed('Temporary business records created')

    await page.getByRole('button', {
      name: 'Refresh Dashboard',
      exact: true
    }).click()

    await checkKpi('Total Leads', '3')
    await checkKpi('Active Clients', '1')
    await checkKpi('Active Projects', '1')
    await checkKpi('Total Tasks', '4')
    await checkKpi('Completed Tasks', '1')
    await checkKpi('Overdue Tasks', '1')
    await checkKpi('Lost Leads', '1')
    await checkKpi('Lead Conversion', '33%')
    await checkKpi('Task Completion', '33%')

    const currency = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    })

    await checkKpi(
      'Open Pipeline Value',
      currency.format(10000)
    )

    await checkKpi(
      'Won Lead Value',
      currency.format(20000)
    )

    await checkKpi(
      'Project Budget',
      currency.format(50000)
    )

    for (const title of [
      'Sales Pipeline',
      'Task Distribution',
      'Project Distribution',
      'Client Distribution'
    ]) {
      await expect(
        page.getByRole('heading', {
          name: title,
          exact: true
        })
      ).toBeVisible()

      passed(`${title} chart visible`)
    }

    const recentLeads = page.locator('section').filter({
      has: page.getByRole('heading', {
        name: 'Recent Leads',
        exact: true
      })
    })

    await expect(
      recentLeads.getByText('Browser Test New Lead', {
        exact: true
      })
    ).toBeVisible()

    passed('Recent leads display actual data')

    const recentProjects = page.locator('section').filter({
      has: page.getByRole('heading', {
        name: 'Recent Projects',
        exact: true
      })
    })

    await expect(
      recentProjects.getByText('Browser Test Project', {
        exact: true
      })
    ).toBeVisible()

    passed('Recent projects display actual data')

    const recentTasks = page.locator('section').filter({
      has: page.getByRole('heading', {
        name: 'Recent Tasks',
        exact: true
      })
    })

    await expect(
      recentTasks.getByText('Browser Completed Task', {
        exact: true
      })
    ).toBeVisible()

    passed('Recent tasks display actual data')

    const deadlines = page.locator('section').filter({
      has: page.getByRole('heading', {
        name: 'Upcoming Deadlines',
        exact: true
      })
    })

    await expect(
      deadlines.getByText('Browser Upcoming Task', {
        exact: true
      })
    ).toBeVisible()

    await expect(
      deadlines.getByText('Browser Overdue Task', {
        exact: true
      })
    ).toHaveCount(0)

    await expect(
      deadlines.getByText('Browser Cancelled Task', {
        exact: true
      })
    ).toHaveCount(0)

    await expect(
      deadlines.getByText('Browser Completed Task', {
        exact: true
      })
    ).toHaveCount(0)

    passed('Upcoming deadline filtering')

    await expect(
      page.getByText('Last updated:', { exact: false })
    ).toBeVisible()

    passed('Last updated timestamp')

    await expect(
      page.getByText('Demo data', { exact: true })
    ).toHaveCount(0)

    await expect(
      page.getByText('Rahul Sharma', { exact: true })
    ).toHaveCount(0)

    passed('Old dummy data removed')

    await recentLeads.getByRole('link', {
      name: 'View all'
    }).click()

    await expect(page).toHaveURL(/\/leads$/)

    passed('View all navigation')

    await page.goto(`${frontend}/dashboard`)

    await checkKpi('Total Leads', '3')

    await page.route('**/api/dashboard/overview', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Simulated dashboard failure'
        })
      })
    })

    await page.getByRole('button', {
      name: 'Refresh Dashboard',
      exact: true
    }).click()

    await expect(
      page.getByRole('heading', {
        name: 'Unable to load dashboard'
      })
    ).toBeVisible()

    passed('Dashboard API error handling')

    await page.unroute('**/api/dashboard/overview')

    await page.getByRole('button', {
      name: 'Try Again',
      exact: true
    }).click()

    await checkKpi('Total Leads', '3')

    passed('Retry button recovers dashboard')

    await page.screenshot({
      path: 'test-results/dashboard-verified.png',
      fullPage: true
    })

    expect(browserErrors).toEqual([])

    passed('No uncaught browser JavaScript errors')

    console.log('ALL DASHBOARD BROWSER ASSERTIONS PASSED')

  } finally {
    console.log('Cleaning temporary test records...')

    const cleanupErrors: string[] = []

    for (const record of records.reverse()) {
      try {
        const response = await request.delete(
          `${api}/${record.path}/${record.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok()) {
          cleanupErrors.push(`${record.path}/${record.id}`)
        }
      } catch {
        cleanupErrors.push(`${record.path}/${record.id}`)
      }
    }

    console.log(`CLEANUP ERRORS: ${cleanupErrors.length}`)

    expect(cleanupErrors).toEqual([])
  }
})
