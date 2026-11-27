import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test("Workspace search, notifications and filters", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);

  const api = "http://localhost:5000/api";
  const frontend = "http://localhost:5173";

  const email = `workspace-${randomUUID()}@example.com`;
  const password = `Test-${randomUUID()}!`;

  const records: { path: string; id: string }[] = [];
  const browserErrors: string[] = [];

  let token = "";

  page.on("pageerror", (error) => {
    browserErrors.push(error.message);
  });

  function passed(label: string) {
    console.log(`PASS: ${label}`);
  }

  async function createRecord(path: string, data: Record<string, unknown>) {
    const response = await request.post(`${api}/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data,
    });

    expect(response.status(), await response.text()).toBe(201);

    const body = await response.json();

    records.push({
      path,
      id: body.data.id,
    });

    return body.data;
  }

  try {
    const registration = await request.post(`${api}/auth/register`, {
      data: {
        name: "Workspace Browser User",
        email,
        password,
      },
    });

    expect(registration.status()).toBe(201);

    const login = await request.post(`${api}/auth/login`, {
      data: { email, password },
    });

    expect(login.status()).toBe(200);

    token = (await login.json()).data.token;

    expect(token).toBeTruthy();

    passed("Temporary account authenticated");

    await page.addInitScript(
      ({ token }) => {
        sessionStorage.setItem("clientflow_token", token);
      },
      { token },
    );

    await page.goto(`${frontend}/dashboard`);

    const notificationButton = page.getByRole("button", {
      name: "Notifications",
      exact: true,
    });

    const notificationDialog = page.getByRole("dialog", {
      name: "Workspace notifications",
    });

    await notificationButton.click();

    await expect(
      notificationDialog.getByText("You're all caught up!"),
    ).toBeVisible();

    passed("Empty notification state");

    await page.keyboard.press("Escape");

    await expect(notificationDialog).toHaveCount(0);

    passed("Notifications close with Escape");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const future = new Date(today);
    future.setUTCDate(future.getUTCDate() + 3);

    const past = new Date(today);
    past.setUTCDate(past.getUTCDate() - 2);

    await createRecord("leads", {
      name: "Workspace Alpha Lead",
      status: "NEW",
      priority: "HIGH",
      value: 10000,
    });

    await createRecord("leads", {
      name: "Workspace Beta Lead",
      status: "QUALIFIED",
      priority: "LOW",
      value: 20000,
    });

    const client = await createRecord("clients", {
      name: "Workspace Alpha Client",
      company: "Workspace Company",
      status: "ACTIVE",
    });

    const projectA = await createRecord("projects", {
      name: "Workspace Alpha Project",
      clientId: client.id,
      status: "IN_PROGRESS",
      dueDate: future.toISOString(),
    });

    const projectB = await createRecord("projects", {
      name: "Workspace Beta Project",
      clientId: client.id,
      status: "IN_PROGRESS",
    });

    await createRecord("tasks", {
      title: "Workspace Alpha Task",
      projectId: projectA.id,
      status: "TO_DO",
      priority: "HIGH",
      dueDate: future.toISOString(),
    });

    await createRecord("tasks", {
      title: "Workspace Beta Task",
      projectId: projectB.id,
      status: "IN_PROGRESS",
      priority: "LOW",
      dueDate: past.toISOString(),
    });

    passed("Temporary workspace records created");

    const searchButton = page.getByRole("button", {
      name: "Global search",
      exact: true,
    });

    await searchButton.click();

    const searchDialog = page.getByRole("dialog", {
      name: "Global search",
    });

    await expect(searchDialog).toBeVisible();

    passed("Global search opens");

    const searchInput = searchDialog.getByLabel("Search workspace");

    await searchInput.fill("Workspace Alpha");

    for (const name of [
      "Workspace Alpha Lead",
      "Workspace Alpha Client",
      "Workspace Alpha Project",
      "Workspace Alpha Task",
    ]) {
      await expect(searchDialog.getByText(name, { exact: true })).toBeVisible();

      passed(`Global search finds ${name}`);
    }

    await searchInput.fill("NonexistentWorkspaceRecord");

    await expect(
      searchDialog.getByText("No matching records found."),
    ).toBeVisible();

    passed("Global search empty result");

    await page.keyboard.press("Escape");

    await expect(searchDialog).toHaveCount(0);

    passed("Global search closes with Escape");

    await searchButton.click();

    await searchInput.fill("Workspace Alpha Lead");

    await searchDialog
      .getByText("Workspace Alpha Lead", { exact: true })
      .click();

    await expect(page).toHaveURL(/\/leads$/);
    await expect(searchDialog).toHaveCount(0);

    passed("Global search navigates to Leads");

    await notificationButton.click();

    await expect(
      notificationDialog.getByRole("button", { name: /^Workspace Alpha Project Project due:/ }),
    ).toBeVisible();

    await expect(
      notificationDialog.getByText("Workspace Alpha Task", { exact: true }),
    ).toBeVisible();

    passed("Notifications display upcoming records");

    await expect(
      notificationDialog.getByText(/overdue/i).first(),
    ).toBeVisible();

    passed("Overdue task notification displayed");

    await notificationDialog
      .getByRole("button", {
        name: "Refresh notifications",
      })
      .click();

    await expect(
      notificationDialog.getByText("Workspace Alpha Task", { exact: true }),
    ).toBeVisible();

    passed("Notification refresh works");

    await notificationDialog
      .getByText("Workspace Alpha Task", { exact: true })
      .click();

    await expect(page).toHaveURL(/\/tasks$/);
    await expect(notificationDialog).toHaveCount(0);

    passed("Notification navigates to Tasks");

    await expect(
      page.getByText("Workspace Alpha Task", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText("Workspace Beta Task", { exact: true }),
    ).toBeVisible();

    const projectFilter = page.getByRole("button", {
      name: "Filter by project",
    });

    await projectFilter.click();

    const projectSearch = page.getByRole("textbox", {
      name: /search projects/i,
    });

    await projectSearch.fill("Workspace Alpha Project");

    await page
      .getByRole("button", {
        name: /^Workspace Alpha Project/,
      })
      .click();

    await expect(projectFilter).toContainText("Workspace Alpha Project");

    await expect(
      page.getByText("Workspace Alpha Task", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText("Workspace Beta Task", { exact: true }),
    ).toHaveCount(0);

    passed("Task project filter applies correctly");

    await projectFilter.click();

    await projectSearch.fill("NonexistentProject");

    await expect(
      page.getByText("No matching projects", { exact: true }),
    ).toBeVisible();

    passed("Project search empty result");

    await page.keyboard.press("Escape");

    await expect(projectSearch).toHaveCount(0);

    passed("Project dropdown closes with Escape");

    await page
      .getByRole("button", {
        name: "Clear Filters",
        exact: true,
      })
      .click();

    await expect(projectFilter).toContainText("All Projects");

    await expect(
      page.getByText("Workspace Beta Task", { exact: true }),
    ).toBeVisible();

    passed("Task Clear Filters restores all projects");

    await page.goto(`${frontend}/leads`);

    await expect(
      page.getByText("Workspace Alpha Lead", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText("Workspace Beta Lead", { exact: true }),
    ).toBeVisible();

    const leadSearch = page.getByLabel("Search leads");
    const statusFilter = page.getByLabel("Filter by status");
    const priorityFilter = page.getByLabel("Filter by priority");
    const rowsFilter = page.getByLabel("Rows per page");

    await leadSearch.fill("Workspace Alpha");
    await statusFilter.selectOption("NEW");
    await priorityFilter.selectOption("HIGH");

    const alternateRows = await rowsFilter
      .locator("option")
      .evaluateAll((options) =>
        options
          .map((option) => (option as HTMLOptionElement).value)
          .find((value) => value !== "10" && value !== ""),
      );

    expect(alternateRows).toBeTruthy();

    await rowsFilter.selectOption(alternateRows!);

    await expect(
      page.getByText("Workspace Alpha Lead", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText("Workspace Beta Lead", { exact: true }),
    ).toHaveCount(0);

    passed("Combined lead filters work");

    await page
      .getByRole("button", {
        name: "Clear Filters",
        exact: true,
      })
      .click();

    await expect(leadSearch).toHaveValue("");
    await expect(statusFilter).toHaveValue("");
    await expect(priorityFilter).toHaveValue("");
    await expect(rowsFilter).toHaveValue("10");

    passed("All lead filter controls reset");

    await expect(
      page.getByText("Workspace Alpha Lead", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText("Workspace Beta Lead", { exact: true }),
    ).toBeVisible();

    passed("Lead Clear Filters restores all records");

    await page.screenshot({
      path: "test-results/workspace-verified.png",
      fullPage: true,
    });

    expect(browserErrors).toEqual([]);

    passed("No uncaught browser JavaScript errors");

    console.log("ALL WORKSPACE BROWSER CHECKS PASSED");
  } finally {
    const cleanupErrors: string[] = [];

    for (const record of records.reverse()) {
      try {
        const response = await request.delete(
          `${api}/${record.path}/${record.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok()) {
          cleanupErrors.push(`${record.path}/${record.id}`);
        }
      } catch {
        cleanupErrors.push(`${record.path}/${record.id}`);
      }
    }

    console.log(`CLEANUP ERRORS: ${cleanupErrors.length}`);

    expect(cleanupErrors).toEqual([]);
  }
});
