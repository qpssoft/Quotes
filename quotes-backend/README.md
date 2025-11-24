# Quotes Backend

Azure Functions backend for the Quotes application.

## Architecture

- **Quotes.Core**: Domain models and interfaces
- **Quotes.Application**: Business logic and services
- **Quotes.Infrastructure**: Data access and external services
- **Quotes.Functions**: Azure Functions HTTP triggers

## Prerequisites

- [.NET SDK 6.0+](https://dotnet.microsoft.com/download)
- [Azure Functions Core Tools v4](https://docs.microsoft.com/azure/azure-functions/functions-run-local)
- [Azurite](https://docs.microsoft.com/azure/storage/common/storage-use-azurite) (local storage emulator)
- [Node.js](https://nodejs.org/) (for Azurite installation)

### Install Prerequisites

```powershell
# Install Azurite globally
npm install -g azurite

# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Verify installations
azurite --version
func --version
dotnet --version
```

## Quick Start

### Option 1: One-Click Start (Easiest! ⭐)

**Just double-click these files:**

- 📂 `START_BACKEND.bat` - Starts everything (build + all services)
- 📂 `STOP_BACKEND.bat` - Stops all services (kills by process name and port)

**Features:**
- Auto-build before starting
- Kills processes by name (azurite, func, node) and port (7071, 10000-10002, 3000)
- Force terminates stubborn processes
- No manual cleanup needed

That's it! Wait 15-20 seconds, then go to:
- **Admin Portal:** http://localhost:3000
- **Login with:** `root@quotes.com`

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

### Option 2: Using PowerShell Scripts

```powershell
# Start all services (Build + Azurite + Functions + Admin Portal)
.\start-backend.ps1

# Start without Admin Portal
.\start-backend.ps1 -SkipAdmin

# Start without Azurite (if already running)
.\start-backend.ps1 -SkipAzurite

# Stop all services
.\stop-backend.ps1
```

### Option 3: Manual Start

**Terminal 1 - Start Azurite:**
```powershell
cd quotes-backend
azurite --silent --location azurite-data --debug azurite-data\debug.log
```

**Terminal 2 - Start Functions:**
```powershell
cd quotes-backend\src\Quotes.Functions
func start
```

**Terminal 3 - Start Admin Portal:**
```powershell
cd quotes-admin
npm start
```

## Configuration

Local settings are in `src/Quotes.Functions/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "SendGridApiKey": "",
    "KeyVaultUri": ""
  }
}
```

## Development

### Build Solution

```powershell
cd quotes-backend
dotnet build Quotes.Backend.sln
```

### Run Tests

```powershell
dotnet test
```

### Run API Tests

Test all API endpoints locally:

```powershell
cd quotes-backend
.\scripts\test-api-locally.ps1
```

This will test:
- Quote retrieval (GET /api/v1/quotes)
- Filtering by language, category, author
- Single quote retrieval by ID
- Rate limiting (burst traffic)
- Response time (target <500ms)
- Health endpoint

### Clean Build

```powershell
dotnet clean
dotnet build
```

## Endpoints

When running locally, the Functions app is available at: `http://localhost:7071`

### Authentication Endpoints

- `POST /api/v1/auth/login` - Login (creates user if not exists)
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/users/me` - Get current user

### Quote Endpoints

- `GET /api/quotes` - List quotes
- `POST /api/quotes` - Create quote
- `GET /api/quotes/{id}` - Get quote by ID
- `PUT /api/quotes/{id}` - Update quote
- `DELETE /api/quotes/{id}` - Delete quote

### Default Admin Account

On first login, a root administrator account is automatically created:

- **Email:** `root@quotes.com`
- **Role:** Admin (full permissions)
- **Claims:** IsRootAdmin, CanManageUsers, CanManageQuotes, CanAccessAllFeatures

See [ROOT_ADMIN_GUIDE.md](ROOT_ADMIN_GUIDE.md) for complete login instructions.

### Test Accounts

Additional test accounts are created automatically:

- `admin@test.com` - Admin role
- `editor@test.com` - Contributor role
- `user@test.com` - Authenticated role

## Storage Services

Azurite provides local storage emulation:

- **Blob Storage**: `http://127.0.0.1:10000`
- **Queue Storage**: `http://127.0.0.1:10001`
- **Table Storage**: `http://127.0.0.1:10002`

Default account credentials:
- **Account name**: `devstoreaccount1`
- **Account key**: `Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==`

## Troubleshooting

### Azurite won't start
- Check if ports 10000-10002 are available
- Delete `azurite-data` folder and restart
- Check logs: `azurite-data\debug.log`

### Functions won't start
- Ensure Azurite is running first
- Check `local.settings.json` configuration
- Verify .NET SDK version: `dotnet --version`
- Clean and rebuild: `dotnet clean && dotnet build`

### Port conflicts
- Azurite uses ports: 10000, 10001, 10002
- Functions use port: 7071
- Change ports in `local.settings.json` if needed

## Project Structure

```
quotes-backend/
├── src/
│   ├── Quotes.Core/          # Domain layer
│   ├── Quotes.Application/   # Business logic
│   ├── Quotes.Infrastructure/# Data access & services
│   │   └── Services/
│   │       ├── DatabaseInitializer.cs          # Root admin setup
│   │       └── DatabaseInitializerHostedService.cs
│   └── Quotes.Functions/     # API layer
│       ├── Functions/
│       │   └── AuthFunction.cs  # Authentication endpoints
│       └── Middleware/
│           ├── CorsMiddleware.cs     # CORS handling
│           └── AuthenticationMiddleware.cs
├── azurite-data/             # Local storage data
├── scripts/                  # Utility scripts
├── seed-data/                # Sample data
├── START_BACKEND.bat         # ⭐ One-click start (double-click me!)
├── STOP_BACKEND.bat          # ⭐ One-click stop (double-click me!)
├── start-backend.ps1         # Start all services (PowerShell)
├── stop-backend.ps1          # Stop all services (PowerShell)
├── test-root-admin.html      # Test root admin login
├── test-cors.html            # Test CORS configuration
├── QUICK_START.md            # Quick start guide
├── ROOT_ADMIN_GUIDE.md       # Root admin documentation
├── ROOT_ADMIN_SETUP_COMPLETE.md  # Setup summary
├── CORS_FIX_SUMMARY.md       # CORS implementation details
└── Quotes.Backend.sln        # Solution file
```

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - Fast start guide with one-click scripts
- **[ROOT_ADMIN_GUIDE.md](ROOT_ADMIN_GUIDE.md)** - Complete root admin documentation
- **[CORS_FIX_SUMMARY.md](CORS_FIX_SUMMARY.md)** - CORS implementation and troubleshooting
- **[TESTING.md](TESTING.md)** - Testing guide and test accounts
- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Azure deployment instructions

## Recent Updates

### CORS Fix (November 2025)
- ✅ Removed duplicate CORS configuration from `host.json`
- ✅ CORS now handled exclusively by `CorsMiddleware.cs`
- ✅ Fixes `Access-Control-Allow-Origin: *,http://localhost:3000` duplicate header error
- ✅ Supports all localhost ports for development
- ✅ Proper credentials support and preflight handling

### API Testing (November 2025)
- ✅ Created automated test suite (`scripts/test-api-locally.ps1`)
- ✅ Tests T069-T073 (User Story 1 validation)
- ✅ 90.91% pass rate (10/11 tests passing)
- ✅ Average response time: 5.67ms (well under 500ms target)
- ✅ US1 (Anonymous Quote Access) validated locally

### Admin Center Components
- ✅ Layout component with sidebar navigation
- ✅ QuoteList component with filtering and pagination
- ✅ QuoteEditor component for CRUD operations
- ✅ Complete quotesApi service with all endpoints
- ✅ React Router routes configured
- ✅ Mock authentication for development testing
