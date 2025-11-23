#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop all backend services for Quotes application
.DESCRIPTION
    Stops Azurite, Azure Functions, and Quotes Admin processes
.EXAMPLE
    .\stop-backend.ps1
#>

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

Write-Info "=== Stopping Quotes Backend Services ==="
Write-Host ""

$stopped = 0

# Stop Azurite
$azuriteProcesses = Get-Process -Name "azurite" -ErrorAction SilentlyContinue
if ($azuriteProcesses) {
    foreach ($proc in $azuriteProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Success "Stopped Azurite (PID: $($proc.Id))"
            $stopped++
        } catch {
            Write-Warning-Custom "Could not stop Azurite process: $_"
        }
    }
} else {
    Write-Info "No Azurite processes found"
}

# Stop Azure Functions (func.exe)
$funcProcesses = Get-Process -Name "func" -ErrorAction SilentlyContinue
if ($funcProcesses) {
    foreach ($proc in $funcProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Success "Stopped Azure Functions (PID: $($proc.Id))"
            $stopped++
        } catch {
            Write-Warning-Custom "Could not stop Functions process: $_"
        }
    }
} else {
    Write-Info "No Azure Functions processes found"
}

# Stop dotnet processes related to Functions
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*Quotes.Functions*"
}
if ($dotnetProcesses) {
    foreach ($proc in $dotnetProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Success "Stopped dotnet process (PID: $($proc.Id))"
            $stopped++
        } catch {
            Write-Warning-Custom "Could not stop dotnet process: $_"
        }
    }
}

# Stop npm/node processes for Quotes Admin
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*react-scripts*" -or $_.CommandLine -like "*quotes-admin*"
}
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Success "Stopped Quotes Admin node process (PID: $($proc.Id))"
            $stopped++
        } catch {
            Write-Warning-Custom "Could not stop node process: $_"
        }
    }
}

# Stop any remaining npm processes
$npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue
if ($npmProcesses) {
    foreach ($proc in $npmProcesses) {
        try {
            # Check if it's related to quotes-admin
            $cwd = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cwd -like "*quotes-admin*") {
                Stop-Process -Id $proc.Id -Force
                Write-Success "Stopped npm process (PID: $($proc.Id))"
                $stopped++
            }
        } catch {
            Write-Warning-Custom "Could not stop npm process: $_"
        }
    }
}

Write-Host ""
if ($stopped -eq 0) {
    Write-Warning-Custom "No backend services were running"
} else {
    Write-Success "Stopped $stopped process(es)"
}
