# Quickstart Guide - Local Development

Get the Quotes Backend and Admin Center running on your local machine in under 5 minutes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (Automated)](#quick-start-automated)
- [Manual Setup](#manual-setup)
- [Verify Installation](#verify-installation)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

Install these tools before proceeding:

#### 1. Node.js (v20.x or later)

**Check if installed:**
```bash
node --version
npm --version
```

**Install (if needed):**
- Download from: https://nodejs.org/
- Or via winget (Windows):
  ```powershell
  winget install OpenJS.NodeJS.LTS
  ```

#### 2. .NET SDK 8.0

**Check if installed:**
```bash
dotnet --version
# Should show 8.0.x
```

**Install (if needed):**
- Download from: https://dotnet.microsoft.com/download/dotnet/8.0
- Or via winget (Windows):
  ```powershell
  winget install Microsoft.DotNet.SDK.8
  ```

#### 3. Azure Functions Core Tools v4

**Check if installed:**
```bash
func --version
# Should show 4.x.x
```

**Install (if needed):**
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

#### 4. Azurite (Azure Storage Emulator)

**Check if installed:**
```bash
azurite --version
```

**Install (if needed):**
```bash
npm install -g azurite
```

### Clone Repository

```bash
git clone https://github.com/qpssoft/Quotes.git
cd Quotes
```

---

## Quick Start (Automated)

### Windows - One-Click Startup

**Just double-click:** `quotes-backend/START_BACKEND.bat`

This will automatically:
1. ✅ Build the backend project
2. ✅ Start Azurite (Storage Emulator)
3. ✅ Start Azure Functions API
4. ✅ Start Admin Portal (React)

**Wait:** 15-20 seconds for all services to start

**Access:**
- Admin Portal: http://localhost:3000
- Backend API: http://localhost:7071/api/v1
- Swagger UI: http://localhost:7071/api/swagger/ui

### PowerShell (More Control)

```powershell
cd quotes-backend
.\start-backend.ps1

# Or with options:
.\start-backend.ps1 -SkipAzurite  # Skip Azurite if already running
.\start-backend.ps1 -SkipAdmin    # Backend API only
.\start-backend.ps1 -Help         # Show all options
```

### Linux/macOS

```bash
cd quotes-backend
chmod +x start-backend.sh
./start-backend.sh
```

### Login Credentials

**Root Admin (Full Access):**
```
Email: root@quotes.com
```

**Test Accounts:**
```
admin@test.com   (Admin role)
editor@test.com  (Contributor role)
user@test.com    (Authenticated user)
```

---

## Manual Setup

If the automated scripts don't work, follow these manual steps:

### Step 1: Install Dependencies

#### Backend Dependencies

```bash
cd quotes-backend/src/Quotes.Functions
dotnet restore
cd ../../..
```

#### Admin Center Dependencies

```bash
cd quotes-admin
npm install
cd ..
```

### Step 2: Configure Environment Variables

#### Backend Configuration

Create `quotes-backend/src/Quotes.Functions/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "StorageConnectionString": "UseDevelopmentStorage=true",
    "JwtSecret": "your-super-secret-jwt-key-min-32-chars-long-for-dev-only",
    "JwtIssuer": "quotes-api",
    "JwtAudience": "quotes-client",
    "AllowedOrigins": "http://localhost:3000,http://localhost:4200,http://localhost:5173"
  },
  "Host": {
    "LocalHttpPort": 7071,
    "CORS": "*"
  }
}
```

**Important:** This file is `.gitignore`d for security. Never commit secrets.

#### Admin Center Configuration

Create `quotes-admin/.env`:

```bash
REACT_APP_API_URL=http://localhost:7071/api/v1
REACT_APP_MOCK_AUTH=false
```

For mock authentication (no backend needed):
```bash
REACT_APP_API_URL=http://localhost:7071/api/v1
REACT_APP_MOCK_AUTH=true
```

### Step 3: Start Azurite (Storage Emulator)

Open a new terminal:

```bash
azurite --silent --location azurite-data --debug azurite-data\debug.log
```

Or run in background:

```powershell
# Windows (PowerShell)
Start-Process azurite -ArgumentList "--silent --location azurite-data" -WindowStyle Hidden

# Linux/macOS
azurite --silent --location azurite-data &
```

**Verify Azurite is running:**
```bash
curl http://127.0.0.1:10000
# Should return Azure Blob Storage emulator info
```

### Step 4: Seed Initial Data (Optional)

```bash
cd quotes-backend/scripts

# Seed quotes, users, categories
.\seed-data.ps1

# Or manually create test data
.\create-test-user.ps1 -Email "test@example.com" -Name "Test User" -Role "Admin"
```

### Step 5: Start Backend API

Open a new terminal:

```bash
cd quotes-backend/src/Quotes.Functions
func start
```

Or build first:

```bash
cd quotes-backend/src/Quotes.Functions
dotnet build
func start
```

**Wait for:**
```
Functions:
        AuthFunction: [GET,POST] http://localhost:7071/api/v1/auth/{action}
        QuotesFunction: [GET,POST,PUT,DELETE] http://localhost:7071/api/v1/quotes/{id?}
        AdminFunction: [GET,POST,PUT,DELETE] http://localhost:7071/api/v1/admin/{*route}
        UsersFunction: [GET,PUT,DELETE] http://localhost:7071/api/v1/users/{*route}
        HealthFunction: [GET] http://localhost:7071/api/v1/health
        SwaggerFunction: [GET] http://localhost:7071/api/swagger/ui

For detailed output, run func with --verbose flag.
```

### Step 6: Start Admin Center

Open a new terminal:

```bash
cd quotes-admin
npm start
```

**Wait for:**
```
Compiled successfully!

You can now view quotes-admin in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

Browser should automatically open to http://localhost:3000

---

## Verify Installation

### 1. Check Health Endpoint

```bash
curl http://localhost:7071/api/v1/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T00:00:00Z",
  "version": "1.0.0"
}
```

### 2. Get All Quotes (Public Endpoint)

```bash
curl http://localhost:7071/api/v1/quotes
```

**Expected:** Array of quotes (20 default quotes if seeded)

### 3. Test Authentication

Open Admin Center: http://localhost:3000

**With Mock Auth** (REACT_APP_MOCK_AUTH=true):
1. Enter any email (e.g., `test@example.com`)
2. Click **Login**
3. Should redirect to Dashboard

**With Real Backend** (REACT_APP_MOCK_AUTH=false):
1. Enter email: `root@quotes.com`
2. Click **Login**
3. Backend creates/retrieves user
4. Dashboard shows quotes, user info, navigation

### 4. Run Automated Tests

```bash
cd quotes-backend/scripts
.\test-api-locally.ps1
```

**Expected:** 90%+ tests passing (10/11 or better)

---

## Development Workflow

### Backend Development

#### 1. Make Code Changes

Edit files in:
- `quotes-backend/src/Quotes.Core/` - Domain entities
- `quotes-backend/src/Quotes.Application/` - Use cases
- `quotes-backend/src/Quotes.Infrastructure/` - Repositories
- `quotes-backend/src/Quotes.Functions/` - HTTP endpoints

#### 2. Hot Reload

Azure Functions Core Tools automatically detects changes and reloads.

**If it doesn't reload:**
```bash
# Stop the func process (Ctrl+C)
# Rebuild
cd quotes-backend/src/Quotes.Functions
dotnet build
func start
```

#### 3. Test Changes

```bash
# Test specific endpoint
curl http://localhost:7071/api/v1/quotes

# Or use test scripts
cd quotes-backend/scripts
.\test-api-locally.ps1
```

### Admin Center Development

#### 1. Make Code Changes

Edit files in:
- `quotes-admin/src/components/` - React components
- `quotes-admin/src/services/` - API services
- `quotes-admin/src/hooks/` - React hooks
- `quotes-admin/src/pages/` - Page components

#### 2. Hot Reload

React automatically reloads when you save files.

**Watch console for compile errors:**
```
Compiling...
Compiled successfully!
```

#### 3. Test Changes

Open browser developer tools:
- **Console** - Check for errors
- **Network** - Monitor API calls
- **Application** - Check localStorage (auth tokens)

### Debugging

#### Backend Debugging (VS Code)

1. Open `quotes-backend/` folder in VS Code
2. Install C# extension (if not installed)
3. Open `src/Quotes.Functions/QuotesFunction.cs`
4. Set breakpoint (click left of line number)
5. Press **F5** or **Run → Start Debugging**
6. VS Code attaches to func process
7. Make API call → breakpoint hits

#### Admin Center Debugging (VS Code)

1. Open `quotes-admin/` folder in VS Code
2. Install Debugger for Chrome extension
3. Press **F5** or **Run → Start Debugging**
4. Select **Chrome** when prompted
5. Browser opens with debugger attached
6. Set breakpoints in VS Code
7. Interact with UI → breakpoints hit

#### View Logs

**Backend Logs:**
```bash
cd quotes-backend/src/Quotes.Functions
func start --verbose
```

**Azurite Logs:**
```bash
# Check azurite-data/debug.log
cat azurite-data/debug.log
```

**Admin Center Logs:**
- Open browser developer tools (**F12**)
- Go to **Console** tab
- All API calls and errors logged here

---

## Troubleshooting

### Backend Won't Start

**Issue:** `Port 7071 is already in use`

**Solution:** Kill existing func process
```powershell
# Windows
Get-Process | Where-Object { $_.ProcessName -eq 'func' } | Stop-Process -Force

# Linux/macOS
lsof -ti:7071 | xargs kill -9
```

**Issue:** `Cannot find module 'dotnet'`

**Solution:** Install .NET SDK 8.0
```powershell
winget install Microsoft.DotNet.SDK.8
# Or download from: https://dotnet.microsoft.com/download/dotnet/8.0
```

**Issue:** `Unable to connect to Azure Storage`

**Solution:** Start Azurite
```bash
azurite --silent --location azurite-data
```

Verify connection string in `local.settings.json`:
```json
"AzureWebJobsStorage": "UseDevelopmentStorage=true"
```

**Issue:** `No quotes returned from /api/v1/quotes`

**Solution:** Seed data
```bash
cd quotes-backend/scripts
.\seed-data.ps1
```

### Admin Center Won't Start

**Issue:** `Port 3000 is already in use`

**Solution:** Kill existing process or change port
```powershell
# Windows
Get-Process | Where-Object { $_.Path -like '*node.exe*' } | Stop-Process -Force

# Or change port
$env:PORT=3001; npm start
```

**Issue:** `Module not found` errors

**Solution:** Reinstall dependencies
```bash
cd quotes-admin
rm -rf node_modules package-lock.json
npm install
```

**Issue:** `Cannot connect to backend API`

**Solution:** Check CORS and API URL

1. Verify backend is running: http://localhost:7071/api/v1/health
2. Check `.env` file:
   ```bash
   REACT_APP_API_URL=http://localhost:7071/api/v1
   ```
3. Check backend CORS in `local.settings.json`:
   ```json
   "AllowedOrigins": "http://localhost:3000"
   ```

### Authentication Issues

**Issue:** Login returns 401 Unauthorized

**Solution:** Check JWT configuration

1. Verify `JwtSecret` in `local.settings.json` (min 32 chars)
2. Check AuthenticationMiddleware.cs is enabled
3. Use mock auth for testing:
   ```bash
   # .env
   REACT_APP_MOCK_AUTH=true
   ```

**Issue:** Token expired

**Solution:** Tokens expire after 1 hour. Re-login:
```javascript
// In browser console
localStorage.clear()
// Refresh page
```

### Azurite Issues

**Issue:** `Azurite Blob service is starting...` hangs

**Solution:** Clear Azurite data
```bash
cd quotes-backend
rm -rf azurite-data
mkdir azurite-data
azurite --silent --location azurite-data
```

**Issue:** `ENOSPC: System limit for number of file watchers reached`

**Solution (Linux):** Increase file watcher limit
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Performance Issues

**Issue:** Slow API responses

**Solution:** Check Application Insights overhead

1. Disable telemetry for local dev:
   ```json
   // local.settings.json
   "APPINSIGHTS_INSTRUMENTATIONKEY": ""
   ```
2. Build in Release mode:
   ```bash
   dotnet build -c Release
   ```

**Issue:** High memory usage

**Solution:** Restart services
```powershell
# Kill all dev processes
Get-Process | Where-Object { $_.ProcessName -match 'azurite|func|node' } | Stop-Process -Force

# Restart
cd quotes-backend
.\start-backend.ps1
```

---

## Next Steps

### Learn More

- **Backend README:** `quotes-backend/README.md`
- **Admin Center README:** `quotes-admin/README.md`
- **API Documentation:** `docs/client-integration.md`
- **Deployment Guide:** `docs/deployment.md`
- **Swagger UI:** http://localhost:7071/api/swagger/ui

### Try These

1. **Submit a Quote:**
   - Login to Admin Center
   - Go to **My Quotes** → **Create New**
   - Submit a quote
   - As admin, go to **Submissions** → **Approve**

2. **Test Filtering:**
   ```bash
   curl "http://localhost:7071/api/v1/quotes?language=vi&category=wisdom"
   ```

3. **Create Custom User:**
   ```bash
   cd quotes-backend/scripts
   .\create-test-user.ps1 -Email "custom@example.com" -Name "Custom User" -Role "Admin"
   ```

4. **Run E2E Tests:**
   ```bash
   cd quotes-admin
   npm run test:e2e
   ```

---

## Support

**Having issues?**
- Check logs in terminal windows
- Review browser console (F12)
- Check Application Insights (if enabled)
- Create GitHub issue: https://github.com/qpssoft/Quotes/issues

**Common Resources:**
- Azure Functions: https://learn.microsoft.com/azure/azure-functions/
- React: https://react.dev/
- Azurite: https://learn.microsoft.com/azure/storage/common/storage-use-azurite

---

## Quick Reference

### Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Admin Center | http://localhost:3000 | React UI |
| Backend API | http://localhost:7071/api/v1 | Azure Functions |
| Swagger UI | http://localhost:7071/api/swagger/ui | API docs |
| Health Check | http://localhost:7071/api/v1/health | API status |
| Azurite Blob | http://127.0.0.1:10000 | Storage emulator |
| Azurite Queue | http://127.0.0.1:10001 | Queue emulator |
| Azurite Table | http://127.0.0.1:10002 | Table emulator |

### Default Test Accounts

| Email | Role | Access |
|-------|------|--------|
| root@quotes.com | Admin | Full access |
| admin@test.com | Admin | Admin Center |
| editor@test.com | Contributor | Submit quotes |
| user@test.com | Authenticated | View quotes |

### Useful Commands

```bash
# Start everything
cd quotes-backend && .\start-backend.ps1

# Backend only
cd quotes-backend/src/Quotes.Functions && func start

# Admin Center only
cd quotes-admin && npm start

# Run tests
cd quotes-backend/scripts && .\test-api-locally.ps1

# Seed data
cd quotes-backend/scripts && .\seed-data.ps1

# Stop all processes (Windows)
Get-Process | Where-Object { $_.ProcessName -match 'azurite|func|node' } | Stop-Process -Force
```

---

**Ready to develop?** → Run `START_BACKEND.bat` and start coding! 🚀
