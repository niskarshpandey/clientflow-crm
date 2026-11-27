# ClientFlow - Known Issues and Verification Tracker

## BUG-001: Clear Filters
- Module: Lead Management
- Priority: Medium
- Status: Resolved
- Resolution: Reset search, status, priority, pagination and rows per page.
- Verification: Manual and automated browser checks passed.

## TEST-001: Backend Validation
- Module: Lead Management
- Priority: High
- Status: Completed
- Verification: 54 logged API checks passed.
- Coverage: Authentication, validation, normalization, pagination, account isolation and filtering.

## TEST-002: Final Regression Testing
- Priority: High
- Status: Local regression completed
- Backend: 2 automated tests passed.
- Frontend: 3 automated tests passed.
- Total logged PASS checks: 158.
- Backend build: Passed.
- Frontend build: Passed.
- ESLint: Passed.
- Remaining: Production environment smoke testing and broader regression coverage.

## BUG-002: Non-functional Global Search
- Module: Application Header
- Priority: Medium
- Status: Resolved
- Resolution: Implemented searchable Leads, Clients, Projects and Tasks.
- Verification: Manual and automated browser checks passed.
- Limitation: Results navigate to modules rather than individual record details.

## BUG-003: Non-functional Notification Bell
- Module: Application Header
- Priority: Medium
- Status: Resolved
- Resolution: Implemented upcoming project deadlines, task deadlines and overdue task notifications.
- Verification: Manual and automated browser checks passed.
- Limitation: On-demand refresh; no persistent read state or push notifications.

## BUG-004: Task Project Filter
- Module: Task Management
- Priority: Medium
- Status: Resolved
- Resolution: Implemented searchable project dropdown with integrated filtering.
- Verification: Manual and automated browser checks passed.

## SECURITY-001: Concurrent Password Changes
- Module: Account Security
- Priority: High
- Status: Resolved and regression tested
- Verification: Exactly one concurrent password change succeeds.
- Old JWT rejected across eight protected endpoints.
- Old and losing passwords rejected.
- Winning password and new JWT accepted.

## TODO-001: Mobile Responsiveness
- Priority: High
- Status: Pending
- Task: Verify and improve mobile layouts, navigation, tables, forms and dialogs.

## TODO-002: Production Security
- Priority: High
- Status: Pending
- Task: Review session storage, rate limiting, environment configuration, HTTPS and deployment security.

## TODO-003: Accessibility
- Priority: Medium
- Status: Pending
- Task: Improve keyboard navigation, dialog focus management and accessible controls.

## TODO-004: Test Data Management
- Priority: Medium
- Status: Pending
- Task: Use an isolated test database and implement safe test-account cleanup.

## TODO-005: Production Deployment
- Priority: High
- Status: Pending
- Task: Configure production database, backend, frontend, migrations and deployment smoke tests.

## TODO-006: Expanded Regression Coverage
- Priority: Medium
- Status: Pending
- Task: Expand automated CRUD, account isolation, concurrency and cross-browser coverage.

## Day 15 Verification Summary
- Automated API tests: 2 passed, 0 failed.
- Automated browser tests: 3 passed, 0 failed.
- Logged PASS checks: 158.
- Dashboard and workspace record cleanup errors: 0.
- Backend build: Passed.
- Frontend build: Passed.
- ESLint: Passed.
- Local regression verification: Completed.
- Production readiness: Pending.