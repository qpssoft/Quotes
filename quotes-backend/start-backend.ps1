<#
.SYNOPSIS
    Start all backend services for Quotes application
.DESCRIPTION
    Starts Azurite, Azure Functions, and Quotes Admin in separate processes
.EXAMPLE
    .\start-backend.ps1
#>

param(
    [switch]$SkipAzurite,
    [switch]$SkipAdmin,
    [switch]$Help
)

if ($Help) {
    Get-Help $MyInvocation.MyCommand.Path -Detailed
    exit 0
}

$ErrorActionPreference = "Stop"
$script:processes = @()

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Stop-AllProcesses {
    Write-Info "Stopping all backend processes..."
    foreach ($proc in $script:processes) {
        if ($proc -and !$proc.HasExited) {
            try {
                $proc.Kill()
                Write-Success "Stopped process: $($proc.ProcessName) (PID: $($proc.Id))"
            } catch {
                Write-Warning-Custom "Could not stop process: $($proc.ProcessName)"
            }
        }
    }
}

Write-Info "=== Quotes Backend Startup ==="
Write-Host ""

# Check prerequisites
Write-Info "Checking prerequisites..."

if (!$SkipAzurite) {
    if (!(Test-CommandExists "azurite")) {
        Write-Error-Custom "Azurite is not installed. Install it with: npm install -g azurite"
        exit 1
    }
    Write-Success "Azurite found"
}

if (!(Test-CommandExists "func")) {
    Write-Error-Custom "Azure Functions Core Tools not installed. Install it with: npm install -g azure-functions-core-tools@4"
    exit 1
}
Write-Success "Azure Functions Core Tools found"

if (!(Test-CommandExists "dotnet")) {
    Write-Error-Custom ".NET SDK is not installed. Download from: https://dotnet.microsoft.com/download"
    exit 1
}
Write-Success ".NET SDK found"

if (!$SkipAdmin) {
    if (!(Test-CommandExists "npm")) {
        Write-Error-Custom "npm is not installed. Download Node.js from: https://nodejs.org/"
        exit 1
    }
    Write-Success "npm found"
}

Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendRoot = $scriptPath
$projectRoot = Split-Path -Parent $backendRoot
$functionsPath = Join-Path $backendRoot "src\Quotes.Functions"
$azuriteDataPath = Join-Path $backendRoot "azurite-data"
$adminPath = Join-Path $projectRoot "quotes-admin"

# Ensure azurite-data directory exists
if (!(Test-Path $azuriteDataPath)) {
    New-Item -ItemType Directory -Path $azuriteDataPath | Out-Null
    Write-Info "Created azurite-data directory"
}

# Start Azurite
if (!$SkipAzurite) {
    Write-Info "Starting Azurite (Storage Emulator)..."
    try {
        $azuriteProcess = Start-Process -FilePath "azurite" -ArgumentList "--silent", "--location", $azuriteDataPath, "--debug", "$azuriteDataPath\debug.log" -WorkingDirectory $backendRoot -PassThru -WindowStyle Hidden
        
        $script:processes += $azuriteProcess
        Start-Sleep -Seconds 2
        
        if ($azuriteProcess.HasExited) {
            Write-Error-Custom "Azurite failed to start. Check logs at: $azuriteDataPath\debug.log"
            exit 1
        }
        
        Write-Success "Azurite started (PID: $($azuriteProcess.Id))"
        Write-Host "   Blob:  http://127.0.0.1:10000" -ForegroundColor Gray
        Write-Host "   Queue: http://127.0.0.1:10001" -ForegroundColor Gray
        Write-Host "   Table: http://127.0.0.1:10002" -ForegroundColor Gray
    } catch {
        Write-Error-Custom "Failed to start Azurite: $_"
        exit 1
    }
    Write-Host ""
} else {
    Write-Warning-Custom "Skipping Azurite startup"
    Write-Host ""
}

# Start Azure Functions
Write-Info "Starting Azure Functions..."
Write-Host ""

try {
    Push-Location $functionsPath
    
    # Use cmd /c to run func which might be a batch file or PS script
    $funcProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "func start" -WorkingDirectory $functionsPath -PassThru
    
    $script:processes += $funcProcess
    
    Start-Sleep -Seconds 3
    
    Write-Success "Azure Functions started (PID: $($funcProcess.Id))"
    Write-Host "   URL: http://localhost:7071" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Error-Custom "Failed to start Azure Functions: $_"
    Stop-AllProcesses
    exit 1
} finally {
    Pop-Location
}

# Start Quotes Admin
if (!$SkipAdmin) {
    Write-Info "Starting Quotes Admin (React App)..."
    
    $nodeModulesPath = Join-Path $adminPath "node_modules"
    if (!(Test-Path $nodeModulesPath)) {
        Write-Warning-Custom "node_modules not found. Running npm install..."
        Push-Location $adminPath
        try {
            & npm install
            if ($LASTEXITCODE -ne 0) {
                throw "npm install failed"
            }
        } catch {
            Write-Error-Custom "Failed to install dependencies: $_"
            Pop-Location
            Stop-AllProcesses
            exit 1
        } finally {
            Pop-Location
        }
    }
    
    try {
        $adminProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm start" -WorkingDirectory $adminPath -PassThru
        
        $script:processes += $adminProcess
        
        Start-Sleep -Seconds 3
        
        Write-Success "Quotes Admin started (PID: $($adminProcess.Id))"
        Write-Host "   URL: http://localhost:3000" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Error-Custom "Failed to start Quotes Admin: $_"
        Stop-AllProcesses
        exit 1
    }
} else {
    Write-Warning-Custom "Skipping Quotes Admin startup"
    Write-Host ""
}

Write-Success "All services started successfully!"
Write-Host ""
Write-Info "Service URLs:"
if (!$SkipAzurite) {
    Write-Host "   Azurite Blob:  http://127.0.0.1:10000" -ForegroundColor Gray
    Write-Host "   Azurite Queue: http://127.0.0.1:10001" -ForegroundColor Gray
    Write-Host "   Azurite Table: http://127.0.0.1:10002" -ForegroundColor Gray
}
Write-Host "   Functions API:  http://localhost:7071" -ForegroundColor Gray
if (!$SkipAdmin) {
    Write-Host "   Admin Portal:   http://localhost:3000" -ForegroundColor Gray
}
Write-Host ""
Write-Warning-Custom "Press Ctrl+C to stop all services"
Write-Host ""

try {
    Wait-Process -Id $funcProcess.Id
} catch {
    # Ignore errors
}

Stop-AllProcesses
Write-Info "All services stopped."
