#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test Azure Functions API endpoints locally
.DESCRIPTION
    Executes API tests for User Story 1 (US1) - Anonymous Quote Access
    Tests: T069-T073 from tasks.md
.PARAMETER BaseUrl
    The base URL of the Azure Functions instance (default: http://localhost:7071)
#>

param(
    [string]$BaseUrl = "http://localhost:7071"
)

$ErrorActionPreference = "Continue"
$apiBase = "$BaseUrl/api/v1"

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Azure Functions API Test Suite" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Base URL: $apiBase" -ForegroundColor Yellow
Write-Host ""

# Color helper functions
function Write-Success { param($msg) Write-Host "[PASS] $msg" -ForegroundColor Green }
function Write-Failure { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red }
function Write-TestHeader { param($msg) Write-Host "`n--- $msg ---" -ForegroundColor Cyan }

$testResults = @{
    Passed = 0
    Failed = 0
    Total = 0
}

# Test helper function
function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Url,
        [int]$ExpectedStatus = 200,
        [scriptblock]$ValidationScript = $null
    )
    
    $testResults.Total++
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            if ($null -eq $ValidationScript) {
                Write-Success "$TestName - Status: $($response.StatusCode)"
                $testResults.Passed++
                return $true
            } else {
                $content = $response.Content | ConvertFrom-Json
                $validationResult = & $ValidationScript $content
                if ($validationResult) {
                    Write-Success "$TestName - Status: $($response.StatusCode) - Validation passed"
                    $testResults.Passed++
                    return $true
                } else {
                    Write-Failure "$TestName - Validation failed"
                    $testResults.Failed++
                    return $false
                }
            }
        } else {
            Write-Failure "$TestName - Expected: $ExpectedStatus, Got: $($response.StatusCode)"
            $testResults.Failed++
            return $false
        }
    } catch {
        Write-Failure "$TestName - Error: $($_.Exception.Message)"
        $testResults.Failed++
        return $false
    }
}

# T069: Test quote retrieval
Write-TestHeader "T069: Test Quote Retrieval (GET /api/v1/quotes)"

Test-Endpoint `
    -TestName "Get all quotes" `
    -Url "$apiBase/quotes" `
    -ValidationScript {
        param($data)
        if ($data -is [Array]) {
            Write-Host "    -> Found $($data.Count) quotes" -ForegroundColor Gray
            return $true
        }
        return $false
    }

# T070: Test filtering
Write-TestHeader "T070: Test Quote Filtering"

Test-Endpoint `
    -TestName "Filter by language (Vietnamese)" `
    -Url "$apiBase/quotes?language=vi" `
    -ValidationScript {
        param($data)
        if ($data -is [Array]) {
            Write-Host "    -> Found $($data.Count) Vietnamese quotes" -ForegroundColor Gray
            return $true
        }
        return $false
    }

Test-Endpoint `
    -TestName "Filter by language (English)" `
    -Url "$apiBase/quotes?language=en" `
    -ValidationScript {
        param($data)
        if ($data -is [Array]) {
            Write-Host "    -> Found $($data.Count) English quotes" -ForegroundColor Gray
            return $true
        }
        return $false
    }

Test-Endpoint `
    -TestName "Filter by category (wisdom)" `
    -Url "$apiBase/quotes?category=wisdom" `
    -ValidationScript {
        param($data)
        if ($data -is [Array]) {
            Write-Host "    -> Found $($data.Count) wisdom quotes" -ForegroundColor Gray
            return $true
        }
        return $false
    }

Test-Endpoint `
    -TestName "Filter by author" `
    -Url "$apiBase/quotes?author=Buddha" `
    -ValidationScript {
        param($data)
        if ($data -is [Array]) {
            Write-Host "    -> Found $($data.Count) quotes by Buddha" -ForegroundColor Gray
            return $true
        }
        return $false
    }

Test-Endpoint `
    -TestName "Combined filters (category + language)" `
    -Url "$apiBase/quotes?category=wisdom&language=vi" `
    -ValidationScript {
        param($data)
        if ($data -is [Array]) {
            Write-Host "    -> Found $($data.Count) Vietnamese wisdom quotes" -ForegroundColor Gray
            return $true
        }
        return $false
    }

# T071: Test single quote retrieval
Write-TestHeader "T071: Test Single Quote Retrieval"

# First, get a quote ID to test with
try {
    $allQuotes = Invoke-RestMethod -Uri "$apiBase/quotes" -Method GET
    if ($allQuotes.Count -gt 0) {
        $testQuoteId = $allQuotes[0].id
        Write-Host "Using test quote ID: $testQuoteId" -ForegroundColor Gray
        
        Test-Endpoint `
            -TestName "Get quote by ID" `
            -Url "$apiBase/quotes/$testQuoteId" `
            -ValidationScript {
                param($data)
                if ($data.id -eq $testQuoteId) {
                    $contentPreview = $data.content.Substring(0, [Math]::Min(50, $data.content.Length))
                    Write-Host "    -> Quote content: $contentPreview..." -ForegroundColor Gray
                    return $true
                }
                return $false
            }
        
        # Test 404 for non-existent quote
        $testResults.Total++
        try {
            Invoke-WebRequest -Uri "$apiBase/quotes/nonexistent-id-12345" -Method GET -UseBasicParsing -ErrorAction Stop | Out-Null
            Write-Failure "Should return 404 for non-existent quote"
            $testResults.Failed++
        } catch {
            if ($_.Exception.Response.StatusCode.Value__ -eq 404) {
                Write-Success "Returns 404 for non-existent quote"
                $testResults.Passed++
            } else {
                Write-Failure "Expected 404, got $($_.Exception.Response.StatusCode.Value__)"
                $testResults.Failed++
            }
        }
    } else {
        Write-Host "⚠ No quotes available for single quote test" -ForegroundColor Yellow
    }
} catch {
    Write-Failure "Could not retrieve quotes for single quote test: $($_.Exception.Message)"
}

# T072: Test rate limiting (basic check)
Write-TestHeader "T072: Test Rate Limiting (Basic Check)"

Write-Host "INFO: Rate limiting is configured for 100 req/min per IP" -ForegroundColor Yellow
Write-Host "  Sending 5 rapid requests to verify endpoint accepts burst traffic..." -ForegroundColor Gray

$rateLimitPassed = $true
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$apiBase/quotes" -Method GET -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -ne 200) {
            $rateLimitPassed = $false
            break
        }
    } catch {
        $rateLimitPassed = $false
        break
    }
}

$testResults.Total++
if ($rateLimitPassed) {
    Write-Success "Burst traffic handled correctly (5 requests)"
    $testResults.Passed++
} else {
    Write-Failure "Failed to handle burst traffic"
    $testResults.Failed++
}

Write-Host "  To fully test rate limiting, use a load testing tool like k6 or Apache Bench" -ForegroundColor Gray

# T073: Test response time (basic check)
Write-TestHeader "T073: Test Response Time"

Write-Host "Measuring response time for 3 requests..." -ForegroundColor Gray

$responseTimes = @()
for ($i = 1; $i -le 3; $i++) {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-WebRequest -Uri "$apiBase/quotes" -Method GET -UseBasicParsing -ErrorAction Stop | Out-Null
        $stopwatch.Stop()
        $responseTimes += $stopwatch.ElapsedMilliseconds
    } catch {
        $stopwatch.Stop()
        Write-Host "  Request $i failed" -ForegroundColor Yellow
    }
}

if ($responseTimes.Count -gt 0) {
    $avgTime = ($responseTimes | Measure-Object -Average).Average
    $timesDisplay = $responseTimes -join 'ms, '
    Write-Host "  -> Response times: ${timesDisplay}ms" -ForegroundColor Gray
    Write-Host "  -> Average: $([Math]::Round($avgTime, 2))ms" -ForegroundColor Gray
    
    $testResults.Total++
    if ($avgTime -lt 500) {
        Write-Success "Average response time is less than 500ms ($([Math]::Round($avgTime, 2))ms)"
        $testResults.Passed++
    } else {
        Write-Failure "Average response time is greater than or equal to 500ms ($([Math]::Round($avgTime, 2))ms)"
        $testResults.Failed++
    }
} else {
    Write-Failure "Could not measure response times"
}

# Additional: Health endpoint check
Write-TestHeader "Additional: Health Endpoint"

Test-Endpoint `
    -TestName "Health check" `
    -Url "$BaseUrl/api/health"

# Summary
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testResults.Total)" -ForegroundColor White
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor Red
Write-Host "Success Rate: $([Math]::Round(($testResults.Passed / $testResults.Total) * 100, 2))%" -ForegroundColor $(if ($testResults.Failed -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

if ($testResults.Failed -eq 0) {
    Write-Host "[SUCCESS] All tests passed! US1 (Anonymous Quote Access) is functional." -ForegroundColor Green
    exit 0
} else {
    Write-Host "[FAILURE] Some tests failed. Review the output above for details." -ForegroundColor Red
    exit 1
}
