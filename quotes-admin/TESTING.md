# Authentication E2E Tests

TypeScript-based end-to-end tests for the Quotes Admin Center authentication system.

## Test Files

- `test1-email-login.ts` - Email login flow
- `test2-token-persistence.ts` - Token storage after page refresh
- `test3-protected-routes.ts` - Protected route access control
- `test4-logout-flow.ts` - Logout functionality

## Mock Authentication

For automated testing, the application supports mock authentication mode. This allows tests to run without requiring the backend API.

### Configuration

Mock authentication is enabled via the `.env.test` file:

```bash
REACT_APP_MOCK_AUTH=true
```

### Mock Accounts

Three predefined test accounts are available:

1. **Admin Account**
   - Email: `admin@test.com`
   - Role: Admin
   - Access: Full admin privileges

2. **Contributor Account**
   - Email: `contributor@test.com`
   - Role: Contributor
   - Access: Can submit and manage quotes

3. **User Account**
   - Email: `user@test.com` (or any other email)
   - Role: Authenticated
   - Access: Basic read-only access

## Running Tests

### Prerequisites

1. Start the Admin Center:
   ```bash
   npm start
   ```

2. Ensure Admin Center is running on `http://localhost:3000`

### Run Individual Tests

```bash
# Test 1: Email Login Flow
npm run test:e2e:1

# Test 2: Token Persistence
npm run test:e2e:2

# Test 3: Protected Routes
npm run test:e2e:3

# Test 4: Logout Flow
npm run test:e2e:4
```

### Run All Tests

```bash
npm run test:e2e:all
```

## Test Features

- **TypeScript**: Full type safety
- **Playwright**: Modern browser automation
- **Headed Mode**: Visual feedback during test execution
- **Screenshots**: Automatic screenshots on success/failure
- **Console Logging**: Detailed step-by-step output
- **Error Handling**: Comprehensive error reporting

## Test Results

Test screenshots are saved to `test-results/`:
- `test1-success.png` / `test1-error.png`
- `test2-success.png` / `test2-error.png`
- `test3-success.png` / `test3-error.png`
- `test4-success.png` / `test4-error.png`

## Development

### TypeScript Configuration

Tests use `tsconfig.test.json` which extends the main TypeScript configuration with test-specific settings:
- CommonJS modules for Node.js compatibility
- ES2020 target for modern JavaScript features
- Playwright types included

### Adding New Tests

1. Create a new `.ts` file following the naming pattern `test{N}-{name}.ts`
2. Add a corresponding npm script in `package.json`
3. Use the existing test files as templates
4. Update this README with the new test description

## Switching Between Mock and Real Authentication

### Mock Mode (for automated tests)
```bash
# Set in .env.test or .env
REACT_APP_MOCK_AUTH=true
npm start
```

### Real Mode (for development/production)
```bash
# Remove or set to false
REACT_APP_MOCK_AUTH=false
npm start
```

## Notes

- Mock authentication bypasses the backend API completely
- Mock tokens are generated client-side with timestamp suffix
- All localStorage operations work identically in both modes
- Tests can run without backend Functions running when in mock mode
