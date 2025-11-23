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
    Write-Host "INFO: $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "SUCCESS: $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
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
            $errorMsg = $_.Exception.Message
            Write-Warning-Custom "Could not stop Azurite process: $errorMsg"
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
            $errorMsg = $_.Exception.Message
            Write-Warning-Custom "Could not stop Functions process: $errorMsg"
        }
    }
} else {
    Write-Info "No Azure Functions processes found"
}

# Stop dotnet processes related to Functions
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
        $cmdLine -like "*Quotes.Functions*"
    } catch {
        $false
    }
}
if ($dotnetProcesses) {
    foreach ($proc in $dotnetProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Success "Stopped dotnet process (PID: $($proc.Id))"
            $stopped++
        } catch {
            $errorMsg = $_.Exception.Message
            Write-Warning-Custom "Could not stop dotnet process: $errorMsg"
        }
    }
}

# Stop npm/node processes for Quotes Admin
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
        $cmdLine -like "*react-scripts*" -or $cmdLine -like "*quotes-admin*"
    } catch {
        $false
    }
}
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Success "Stopped Quotes Admin node process (PID: $($proc.Id))"
            $stopped++
        } catch {
            # Process may have already been killed by a parent process
            if ($_.Exception.Message -notmatch "Cannot find a process") {
                $errorMsg = $_.Exception.Message
                Write-Warning-Custom "Could not stop node process: $errorMsg"
            }
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
            $errorMsg = $_.Exception.Message
            Write-Warning-Custom "Could not stop npm process: $errorMsg"
        }
    }
}

Write-Host ""

# Aggressively kill any remaining related processes
Write-Info "Checking for any remaining processes..."

# Kill any remaining processes by port
$portsToCheck = @(7071, 10000, 10001, 10002, 3000)
foreach ($port in $portsToCheck) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            if ($processId) {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    try {
                        Stop-Process -Id $processId -Force -ErrorAction Stop
                        Write-Success "Killed process on port $port (PID: $processId, Name: $($process.Name))"
                        $stopped++
                    } catch {
                        $errorMsg = $_.Exception.Message
                        Write-Warning-Custom "Could not kill process $processId on port $port - $errorMsg"
                    }
                }
            }
        }
    } catch {
        # Port not in use, continue
    }
}

# Final sweep: kill by process name pattern (more aggressive)
$processesToKill = @(
    @{Name="azurite"; Pattern="azurite"},
    @{Name="func"; Pattern="func"},
    @{Name="node"; Pattern="react-scripts|quotes-admin|webpack"},
    @{Name="dotnet"; Pattern="Quotes.Functions"}
)

foreach ($procInfo in $processesToKill) {
    try {
        $procs = Get-Process -Name $procInfo.Name -ErrorAction SilentlyContinue
        foreach ($proc in $procs) {
            try {
                $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
                if ($commandLine -and $commandLine -match $procInfo.Pattern) {
                    Stop-Process -Id $proc.Id -Force -ErrorAction Stop
                    Write-Success "Force killed $($procInfo.Name) process (PID: $($proc.Id))"
                    $stopped++
                }
            } catch {
                $errorMsg = $_.Exception.Message
                Write-Warning-Custom "Could not force kill $($procInfo.Name) process: $errorMsg"
            }
        }
    } catch {
        # Process not found, continue
    }
}

Write-Host ""
if ($stopped -eq 0) {
    Write-Warning-Custom "No backend services were running"
} else {
    Write-Success "Stopped $stopped process(es) total"
}

Write-Host ""
Write-Info "All backend services stopped"
Write-Host ""
