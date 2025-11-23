# Quotes Admin BDD E2E Tests

Behavior-Driven Development (BDD) end-to-end tests for the Quotes Admin portal using Cucumber and Playwright.

## Overview

This test suite uses:
- **Cucumber** - BDD framework with Gherkin syntax
- **Playwright** - Browser automation
- **TypeScript** - Type-safe test code

## Test Structure

```
tests/
├── features/           # Gherkin feature files (.feature)
│   └── authentication.feature
├── steps/             # Step definitions (.steps.ts)
│   └── authentication.steps.ts
└── support/           # Test infrastructure
    ├── world.ts       # World class (browser context)
    ├── hooks.ts       # Before/After hooks
    └── test-timeouts.ts # Timeout constants
```

## Prerequisites

1. **Backend API must be running:**
   ```bash
   cd ../quotes-backend
   .\START_BACKEND.bat
   ```
   This starts:
   - Azurite (port 10000-10002)
   - Azure Functions (port 7071)

2. **Admin portal must be running:**
   ```bash
   npm start
   ```
   This starts the React dev server on port 3000.

## Running Tests

### Install dependencies first:
```bash
npm install
```

### Run all BDD tests:
```bash
npm run test:bdd
```

### Run only login feature tests:
```bash
npm run test:bdd:login
```

### Run in debug mode (visible browser, slow motion):
```bash
npm run test:bdd:debug
```

### Run with custom options:
```bash
# Visible browser
HEADLESS=false npm run test:bdd

# Slow motion (500ms between actions)
SLOWMO=500 npm run test:bdd

# Both
HEADLESS=false SLOWMO=500 npm run test:bdd
```

## Test Reports

After running tests, reports are generated in:
- `test-results/cucumber-report.html` - HTML report (open in browser)
- `test-results/cucumber-report.json` - JSON report (for CI/CD)
- `test-results/screenshots/` - Screenshots of failed scenarios

## Authentication Feature Coverage

The authentication.feature file covers:

### ✅ Successful Login Scenarios
- Root admin login (`root@quotes.com`)
- Test admin login (`admin@test.com`)
- Contributor login (`editor@test.com`)

### ✅ Validation Scenarios
- Empty email validation
- Invalid email format validation
- Empty name validation

### ✅ Error Handling
- Backend API unavailable

### ✅ UI Verification
- Login form displays correctly
- All required fields present

### ✅ Session Management
- Token persistence after login
- Page refresh maintains session
- Redirect authenticated users
- Session overwrite with new login

## Test Accounts

The following test accounts are available (auto-created by backend):

| Email | Role | Notes |
|-------|------|-------|
| `root@quotes.com` | Admin | Root administrator with full permissions |
| `admin@test.com` | Admin | Test admin account |
| `editor@test.com` | Contributor | Test contributor account |
| `user@test.com` | Authenticated | Regular user account |

## Writing New Tests

### 1. Add a scenario to the feature file:

```gherkin
Scenario: My new test scenario
  Given I am on the login page
  When I do something
  Then something should happen
```

### 2. Run the tests:

Cucumber will output step definition snippets for any undefined steps:

```typescript
When('I do something', async function (this: QuotesAdminWorld) {
  // TODO: implement step
});
```

### 3. Implement the step in `tests/steps/authentication.steps.ts`:

```typescript
When('I do something', async function (this: QuotesAdminWorld) {
  // Your implementation here
  await this.page!.click('button');
});
```

## Best Practices

1. **Use data-testid attributes** for reliable element selection:
   ```html
   <button data-testid="login-button">Login</button>
   ```

2. **Wait for API responses:**
   ```typescript
   await this.page!.waitForTimeout(TestTimeout.API_RESPONSE);
   ```

3. **Wait for navigation:**
   ```typescript
   await this.page!.waitForURL('/dashboard', { timeout: TestTimeout.NAVIGATION });
   ```

4. **Clear storage between scenarios:**
   ```typescript
   await this.clearStorage();
   ```

5. **Take screenshots on failure:**
   Automatically done by hooks.ts

## Troubleshooting

### Tests fail with "Backend API is not accessible"
- Make sure backend is running: `.\START_BACKEND.bat`
- Check if Functions is listening on port 7071:
  ```bash
  Get-NetTCPConnection -LocalPort 7071
  ```

### Tests fail with "Admin portal is not accessible"
- Make sure React dev server is running: `npm start`
- Check if port 3000 is listening:
  ```bash
  Get-NetTCPConnection -LocalPort 3000
  ```

### Browser doesn't close after tests
- Use `Ctrl+C` to stop the test run
- Manually close any remaining browser instances

### "Element not found" errors
- Add appropriate waits: `await this.page!.waitForTimeout(TestTimeout.STANDARD)`
- Check if selectors match actual HTML elements
- Use `data-testid` attributes for more reliable selection

## CI/CD Integration

### GitHub Actions example:

```yaml
- name: Run BDD E2E Tests
  run: |
    npm run test:bdd
  env:
    HEADLESS: true
    CI: true
```

### Azure Pipelines example:

```yaml
- script: npm run test:bdd
  displayName: 'Run BDD E2E Tests'
  env:
    HEADLESS: true
```

## Next Steps

- [ ] Add more feature files (quotes management, user management)
- [ ] Add visual regression testing
- [ ] Add performance testing scenarios
- [ ] Integrate with CI/CD pipeline
- [ ] Add cross-browser testing (Firefox, Safari)
