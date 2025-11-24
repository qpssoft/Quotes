# CORS Verification Script
# Tests CORS configuration from all supported client origins

param(
    [string]$ApiUrl = "http://localhost:7071/api/v1",
    [switch]$Verbose
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "CORS VERIFICATION TEST SUITE" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing API: $ApiUrl" -ForegroundColor Yellow
Write-Host ""

# Test results tracking
$script:testResults = @{
    Passed = 0
    Failed = 0
    Total = 0
}

function Write-TestHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "[$Title]" -ForegroundColor Cyan
    Write-Host ("-" * 60) -ForegroundColor Gray
}

function Write-Success {
    param([string]$Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
    $script:testResults.Passed++
    $script:testResults.Total++
}

function Write-Failure {
    param([string]$Message, [string]$Details = "")
    Write-Host "[FAIL] $Message" -ForegroundColor Red
    if ($Details) {
        Write-Host "       Details: $Details" -ForegroundColor Yellow
    }
    $script:testResults.Failed++
    $script:testResults.Total++
}

function Write-Info {
    param([string]$Message)
    Write-Host "INFO  $Message" -ForegroundColor Gray
}

function Test-CorsOrigin {
    param(
        [string]$Origin,
        [string]$OriginName,
        [string]$Endpoint = "/health"
    )
    
    Write-TestHeader "Testing Origin: $OriginName"
    Write-Info "Origin: $Origin"
    Write-Info "Endpoint: $ApiUrl$Endpoint"
    
    try {
        # Test OPTIONS preflight request
        Write-Info "Testing OPTIONS preflight request..."
        $optionsResponse = Invoke-WebRequest `
            -Uri "$ApiUrl$Endpoint" `
            -Method Options `
            -Headers @{
                "Origin" = $Origin
                "Access-Control-Request-Method" = "GET"
                "Access-Control-Request-Headers" = "content-type,authorization"
            } `
            -SkipHttpErrorCheck `
            -ErrorAction Stop

        # Check OPTIONS response
        if ($optionsResponse.StatusCode -eq 200 -or $optionsResponse.StatusCode -eq 204) {
            Write-Success "OPTIONS request successful (Status: $($optionsResponse.StatusCode))"
        } else {
            Write-Failure "OPTIONS request failed" "Status: $($optionsResponse.StatusCode)"
            return
        }

        # Verify CORS headers in OPTIONS response
        $allowOrigin = $optionsResponse.Headers["Access-Control-Allow-Origin"]
        $allowMethods = $optionsResponse.Headers["Access-Control-Allow-Methods"]
        $allowHeaders = $optionsResponse.Headers["Access-Control-Allow-Headers"]
        $allowCredentials = $optionsResponse.Headers["Access-Control-Allow-Credentials"]

        if ($allowOrigin) {
            if ($allowOrigin -eq $Origin -or $allowOrigin -eq "*") {
                Write-Success "Access-Control-Allow-Origin header present: $allowOrigin"
            } else {
                Write-Failure "Access-Control-Allow-Origin mismatch" "Expected: $Origin, Got: $allowOrigin"
            }
        } else {
            Write-Failure "Access-Control-Allow-Origin header missing"
        }

        if ($allowMethods) {
            Write-Success "Access-Control-Allow-Methods header present: $allowMethods"
        } else {
            Write-Failure "Access-Control-Allow-Methods header missing"
        }

        if ($allowHeaders) {
            Write-Success "Access-Control-Allow-Headers header present"
        } else {
            Write-Failure "Access-Control-Allow-Headers header missing"
        }

        if ($allowCredentials) {
            Write-Success "Access-Control-Allow-Credentials header present: $allowCredentials"
        } else {
            Write-Info "Access-Control-Allow-Credentials header not present (optional)"
        }

        # Test actual GET request with Origin header
        Write-Info "Testing actual GET request with Origin header..."
        $getResponse = Invoke-WebRequest `
            -Uri "$ApiUrl$Endpoint" `
            -Method Get `
            -Headers @{
                "Origin" = $Origin
            } `
            -SkipHttpErrorCheck `
            -ErrorAction Stop

        if ($getResponse.StatusCode -eq 200) {
            Write-Success "GET request successful (Status: $($getResponse.StatusCode))"
        } else {
            Write-Failure "GET request failed" "Status: $($getResponse.StatusCode)"
            return
        }

        # Verify CORS headers in GET response
        $getAllowOrigin = $getResponse.Headers["Access-Control-Allow-Origin"]
        if ($getAllowOrigin) {
            if ($getAllowOrigin -eq $Origin -or $getAllowOrigin -eq "*") {
                Write-Success "GET response has Access-Control-Allow-Origin: $getAllowOrigin"
            } else {
                Write-Failure "GET response Access-Control-Allow-Origin mismatch" "Expected: $Origin, Got: $getAllowOrigin"
            }
        } else {
            Write-Failure "GET response missing Access-Control-Allow-Origin header"
        }

    } catch {
        Write-Failure "Request failed with exception" $_.Exception.Message
        if ($Verbose) {
            Write-Host "Exception details:" -ForegroundColor Yellow
            Write-Host $_.Exception.ToString() -ForegroundColor Gray
        }
    }
}

# Test 1: localhost:3000 (React Admin Center)
Test-CorsOrigin -Origin "http://localhost:3000" -OriginName "React Admin Center (localhost:3000)"

# Test 2: localhost:4200 (Angular Platform)
Test-CorsOrigin -Origin "http://localhost:4200" -OriginName "Angular Platform (localhost:4200)"

# Test 3: localhost:5173 (Vite)
Test-CorsOrigin -Origin "http://localhost:5173" -OriginName "Vite Dev Server (localhost:5173)"

# Test 4: GitHub Pages
Test-CorsOrigin -Origin "https://qpssoft.github.io" -OriginName "GitHub Pages (qpssoft.github.io)"

# Test 5: Electron/Capacitor
Test-CorsOrigin -Origin "capacitor://localhost" -OriginName "Electron/Capacitor (capacitor://localhost)"

# Test 6: Ionic
Test-CorsOrigin -Origin "ionic://localhost" -OriginName "Ionic/React Native (ionic://localhost)"

# Test 7: Verify duplicate header issue is fixed
Write-TestHeader "Testing for Duplicate CORS Headers"
Write-Info "Verifying single Access-Control-Allow-Origin header..."

try {
    $response = Invoke-WebRequest `
        -Uri "$ApiUrl/health" `
        -Method Get `
        -Headers @{ "Origin" = "http://localhost:3000" } `
        -SkipHttpErrorCheck `
        -ErrorAction Stop

    $allowOriginHeaders = $response.Headers["Access-Control-Allow-Origin"]
    
    if ($allowOriginHeaders -is [array]) {
        Write-Failure "Multiple Access-Control-Allow-Origin headers detected" "Count: $($allowOriginHeaders.Count)"
        foreach ($header in $allowOriginHeaders) {
            Write-Info "Header value: $header"
        }
    } else {
        $headerValue = $allowOriginHeaders
        if ($headerValue -like "*,*") {
            Write-Failure "Duplicate values in single header" "Value: $headerValue"
        } else {
            Write-Success "Single Access-Control-Allow-Origin header: $headerValue"
        }
    }
} catch {
    Write-Failure "Failed to test duplicate headers" $_.Exception.Message
}

# Test 8: Verify credentials support
Write-TestHeader "Testing Credentials Support"
Write-Info "Checking Access-Control-Allow-Credentials header..."

try {
    $response = Invoke-WebRequest `
        -Uri "$ApiUrl/health" `
        -Method Get `
        -Headers @{ "Origin" = "http://localhost:3000" } `
        -SkipHttpErrorCheck `
        -ErrorAction Stop

    $allowCredentials = $response.Headers["Access-Control-Allow-Credentials"]
    
    if ($allowCredentials -eq "true") {
        Write-Success "Credentials support enabled: $allowCredentials"
    } else {
        Write-Info "Credentials support not explicitly enabled (header: $allowCredentials)"
    }
} catch {
    Write-Failure "Failed to test credentials support" $_.Exception.Message
}

# Test 9: Test quotes endpoint with CORS
Write-TestHeader "Testing Quotes Endpoint with CORS"
Write-Info "Testing GET /api/v1/quotes with Origin header..."

try {
    $response = Invoke-WebRequest `
        -Uri "$ApiUrl/quotes" `
        -Method Get `
        -Headers @{ "Origin" = "http://localhost:3000" } `
        -SkipHttpErrorCheck `
        -ErrorAction Stop

    if ($response.StatusCode -eq 200) {
        Write-Success "GET /quotes successful with CORS headers"
        
        $allowOrigin = $response.Headers["Access-Control-Allow-Origin"]
        if ($allowOrigin) {
            Write-Success "CORS header present on /quotes endpoint: $allowOrigin"
        } else {
            Write-Failure "CORS header missing on /quotes endpoint"
        }
    } else {
        Write-Failure "GET /quotes failed" "Status: $($response.StatusCode)"
    }
} catch {
    Write-Failure "Failed to test /quotes endpoint" $_.Exception.Message
}

# Test 10: Test with invalid origin
Write-TestHeader "Testing with Invalid Origin"
Write-Info "Testing with non-whitelisted origin (should be rejected or wildcard)..."

try {
    $response = Invoke-WebRequest `
        -Uri "$ApiUrl/health" `
        -Method Get `
        -Headers @{ "Origin" = "https://malicious-site.com" } `
        -SkipHttpErrorCheck `
        -ErrorAction Stop

    $allowOrigin = $response.Headers["Access-Control-Allow-Origin"]
    
    if ($null -eq $allowOrigin) {
        Write-Success "Invalid origin rejected (no CORS header)"
    } elseif ($allowOrigin -eq "*") {
        Write-Info "Wildcard CORS policy allows all origins"
    } elseif ($allowOrigin -ne "https://malicious-site.com") {
        Write-Success "Invalid origin rejected (different origin returned: $allowOrigin)"
    } else {
        Write-Failure "Invalid origin accepted" "CORS header: $allowOrigin"
    }
} catch {
    Write-Failure "Failed to test invalid origin" $_.Exception.Message
}

# Summary
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Total Tests:  $($script:testResults.Total)" -ForegroundColor White
Write-Host "Passed:       $($script:testResults.Passed)" -ForegroundColor Green
Write-Host "Failed:       $($script:testResults.Failed)" -ForegroundColor $(if ($script:testResults.Failed -gt 0) { "Red" } else { "Green" })

if ($script:testResults.Total -gt 0) {
    $successRate = [math]::Round(($script:testResults.Passed / $script:testResults.Total) * 100, 2)
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })
}

Write-Host ""

# Exit code
if ($script:testResults.Failed -eq 0) {
    Write-Host "All CORS tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some CORS tests failed. Please review the output above." -ForegroundColor Red
    exit 1
}
