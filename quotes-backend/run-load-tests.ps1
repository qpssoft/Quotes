# Run K6 Load Tests
# This script runs k6 load tests for the Quotes Backend API

param(
    [Parameter()]
    [ValidateSet('baseline', 'load', 'all')]
    [string]$TestType = 'baseline',
    
    [Parameter()]
    [string]$BaseUrl = 'http://localhost:7071',
    
    [Parameter()]
    [switch]$SkipBackendCheck
)

$ErrorActionPreference = 'Stop'

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "========================================"
Write-Info "K6 Load Testing Script"
Write-Info "========================================"
Write-Info "Test Type: $TestType"
Write-Info "Base URL: $BaseUrl"
Write-Info ""

# Check if k6 is installed
try {
    $k6Version = k6 version 2>&1
    Write-Success "✓ k6 is installed: $k6Version"
} catch {
    Write-Error "✗ k6 is not installed"
    Write-Warning "Install k6 using: winget install k6 --source winget"
    exit 1
}

# Check if backend is running (unless skipped)
if (-not $SkipBackendCheck) {
    Write-Info "Checking if backend is running..."
    try {
        $healthCheck = Invoke-WebRequest -Uri "$BaseUrl/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($healthCheck.StatusCode -eq 200) {
            Write-Success "✓ Backend is running and healthy"
        } else {
            Write-Warning "Backend returned status code: $($healthCheck.StatusCode)"
        }
    } catch {
        Write-Error "✗ Backend is not responding at $BaseUrl"
        Write-Warning "Start the backend using: .\start-backend.ps1"
        Write-Info "Or skip this check with: -SkipBackendCheck"
        exit 1
    }
}

Write-Info ""

# Navigate to load tests directory
$loadTestsDir = Join-Path $PSScriptRoot "tests\load"
if (-not (Test-Path $loadTestsDir)) {
    Write-Error "Load tests directory not found: $loadTestsDir"
    exit 1
}

Push-Location $loadTestsDir

try {
    switch ($TestType) {
        'baseline' {
            Write-Info "Running BASELINE test (10 concurrent users)..."
            Write-Info "Duration: ~2 minutes"
            Write-Info ""
            k6 run --env BASE_URL=$BaseUrl baseline-test.js
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "`n✓ Baseline test completed"
                if (Test-Path "baseline-results.json") {
                    Write-Info "Results saved to: baseline-results.json"
                }
            } else {
                Write-Error "`n✗ Baseline test failed with exit code $LASTEXITCODE"
                exit $LASTEXITCODE
            }
        }
        
        'load' {
            Write-Info "Running FULL LOAD test (1000 concurrent users)..."
            Write-Info "Duration: ~14 minutes"
            Write-Warning "This is a heavy test - ensure your system can handle the load"
            Write-Info ""
            
            # Confirm before running
            $confirm = Read-Host "Continue with full load test? (y/N)"
            if ($confirm -ne 'y' -and $confirm -ne 'Y') {
                Write-Info "Test cancelled"
                exit 0
            }
            
            k6 run --env BASE_URL=$BaseUrl load-test.js
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "`n✓ Load test completed"
                if (Test-Path "load-test-results.json") {
                    Write-Info "Results saved to: load-test-results.json"
                }
                if (Test-Path "load-test-summary.txt") {
                    Write-Info "Summary saved to: load-test-summary.txt"
                    Write-Info ""
                    Write-Info "Summary:"
                    Get-Content "load-test-summary.txt"
                }
            } else {
                Write-Error "`n✗ Load test failed with exit code $LASTEXITCODE"
                exit $LASTEXITCODE
            }
        }
        
        'all' {
            Write-Info "Running ALL tests (baseline + load)..."
            Write-Info ""
            
            # Run baseline first
            Write-Info "[1/2] Running baseline test..."
            k6 run --env BASE_URL=$BaseUrl baseline-test.js
            
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Baseline test failed - skipping load test"
                exit $LASTEXITCODE
            }
            
            Write-Success "✓ Baseline test passed"
            Write-Info ""
            Start-Sleep -Seconds 5
            
            # Run load test
            Write-Info "[2/2] Running load test..."
            $confirm = Read-Host "Continue with full load test (1000 users, ~14 minutes)? (y/N)"
            if ($confirm -ne 'y' -and $confirm -ne 'Y') {
                Write-Info "Load test cancelled"
                exit 0
            }
            
            k6 run --env BASE_URL=$BaseUrl load-test.js
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "`n✓ All tests completed successfully"
            } else {
                Write-Error "`n✗ Load test failed"
                exit $LASTEXITCODE
            }
        }
    }
    
    Write-Info ""
    Write-Info "========================================"
    Write-Success "Testing Complete"
    Write-Info "========================================"
    
} finally {
    Pop-Location
}
