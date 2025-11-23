# Quick Start - Quotes Backend

## 🚀 One-Click Startup

Just **double-click** this file: **`START_BACKEND.bat`**

It will automatically:
1. ✅ Build the backend project
2. ✅ Start Azurite (Storage Emulator)
3. ✅ Start Azure Functions API
4. ✅ Start Admin Portal (React)

## Service URLs

After startup (takes ~15-20 seconds), access:

- **Admin Portal:** http://localhost:3000
- **Functions API:** http://localhost:7071
- **Azurite Blob:** http://127.0.0.1:10000
- **Azurite Queue:** http://127.0.0.1:10001
- **Azurite Table:** http://127.0.0.1:10002

## Login Credentials

### Root Admin (Full Access)
```
Email: root@quotes.com
```

### Test Accounts
```
Email: admin@test.com  (Admin)
Email: editor@test.com (Contributor)
Email: user@test.com   (User)
```

## Stop Services

Press **Ctrl+C** in the terminal window or close it.

## Troubleshooting

If startup fails:

1. **Check prerequisites are installed:**
   - Node.js & npm
   - .NET SDK 8.0+
   - Azure Functions Core Tools v4
   - Azurite (via npm)

2. **Kill existing processes:**
   ```powershell
   Get-Process | Where-Object { $_.ProcessName -match 'azurite|func|node' } | Stop-Process -Force
   ```

3. **Try manual start:**
   ```powershell
   .\start-backend.ps1
   ```

## Manual Options

Run with PowerShell for more control:

```powershell
# Standard start (all services)
.\start-backend.ps1

# Skip Azurite (if already running)
.\start-backend.ps1 -SkipAzurite

# Skip Admin Portal (API only)
.\start-backend.ps1 -SkipAdmin

# Get help
.\start-backend.ps1 -Help
```

## What Happens on Startup?

1. **Prerequisites Check** - Verifies all tools are installed
2. **Build Project** - Compiles latest code changes
3. **Start Azurite** - Local Azure Storage emulator
4. **Start Functions** - Backend API on port 7071
5. **Start Admin** - React app on port 3000

**Total time:** ~15-20 seconds

---

**Ready to go?** → Double-click **`START_BACKEND.bat`** now! 🚀
