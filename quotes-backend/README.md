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

### Option 1: Using PowerShell Scripts (Recommended)

```powershell
# Start all services (Azurite + Functions + Admin Portal)
.\start-backend.ps1

# Start without Admin Portal
.\start-backend.ps1 -SkipAdmin

# Start without Azurite (if already running)
.\start-backend.ps1 -SkipAzurite

# Stop all services
.\stop-backend.ps1
```

### Option 2: Manual Start

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

### Clean Build

```powershell
dotnet clean
dotnet build
```

## Endpoints

When running locally, the Functions app is available at: `http://localhost:7071`

Available endpoints:
- `GET /api/quotes` - List quotes
- `POST /api/quotes` - Create quote
- `GET /api/quotes/{id}` - Get quote by ID
- `PUT /api/quotes/{id}` - Update quote
- `DELETE /api/quotes/{id}` - Delete quote

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
│   ├── Quotes.Infrastructure/# Data access
│   └── Quotes.Functions/     # API layer
├── azurite-data/             # Local storage data
├── scripts/                  # Utility scripts
├── seed-data/                # Sample data
├── start-backend.ps1         # Start all services
├── stop-backend.ps1          # Stop all services
└── Quotes.Backend.sln        # Solution file
```

## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for Azure deployment instructions.
