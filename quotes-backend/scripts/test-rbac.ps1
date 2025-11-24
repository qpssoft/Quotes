# RBAC Verification Test Suite
# Tests all API endpoints with different role combinations to verify correct 401/403 responses

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:7071/api",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "RBAC Verification Test Suite" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Test data
$TestUsers = @{
    Anonymous = @{
        Token = $null
        Role = "Anonymous"
    }
    User = @{
        Email = "user@example.com"
        Name = "Test User"
        Role = "User"
        Token = $null
    }
    Contributor = @{
        Email = "contributor@example.com"
        Name = "Test Contributor"
        Role = "Contributor"
        Token = $null
    }
    Admin = @{
        Email = "admin@example.com"
        Name = "Test Admin"
        Role = "Admin"
        Token = $null
    }
}

# API Endpoint definitions with expected access
$Endpoints = @(
    @{
        Method = "GET"
        Path = "/v1/quotes"
        Description = "Get all quotes"
        ExpectedAccess = @{
            Anonymous = 200
            User = 200
            Contributor = 200
            Admin = 200
        }
    },
    @{
        Method = "GET"
        Path = "/v1/quotes/{id}"
        Description = "Get quote by ID"
        TestId = "quote-001"
        ExpectedAccess = @{
            Anonymous = 200
            User = 200
            Contributor = 200
            Admin = 200
        }
    },
    @{
        Method = "GET"
        Path = "/v1/auth/me"
        Description = "Get current user"
        ExpectedAccess = @{
            Anonymous = 401
            User = 200
            Contributor = 200
            Admin = 200
        }
    },
    @{
        Method = "POST"
        Path = "/v1/quotes"
        Description = "Create quote"
        Body = @{
            text = "Test quote for RBAC"
            author = "Test Author"
            language = "English"
            category = "Test"
        }
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 201
            Admin = 201
        }
    },
    @{
        Method = "PUT"
        Path = "/v1/quotes/{id}"
        Description = "Update quote"
        TestId = "quote-001"
        Body = @{
            text = "Updated quote"
            author = "Updated Author"
        }
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 200
        }
    },
    @{
        Method = "DELETE"
        Path = "/v1/quotes/{id}"
        Description = "Delete quote"
        TestId = "quote-001"
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 204
        }
    },
    @{
        Method = "GET"
        Path = "/v1/users/me/quotes"
        Description = "Get my quotes"
        ExpectedAccess = @{
            Anonymous = 401
            User = 200
            Contributor = 200
            Admin = 200
        }
    },
    @{
        Method = "GET"
        Path = "/v1/admin/submissions"
        Description = "Get submissions"
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 200
        }
    },
    @{
        Method = "PUT"
        Path = "/v1/admin/quotes/{id}/approve"
        Description = "Approve quote"
        TestId = "quote-001"
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 200
        }
    },
    @{
        Method = "PUT"
        Path = "/v1/admin/quotes/{id}/reject"
        Description = "Reject quote"
        TestId = "quote-001"
        Body = @{
            reason = "Test rejection"
        }
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 200
        }
    },
    @{
        Method = "GET"
        Path = "/v1/admin/users"
        Description = "Get all users"
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 200
        }
    },
    @{
        Method = "GET"
        Path = "/v1/admin/users/{id}"
        Description = "Get user by ID"
        TestId = "user-001"
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 200
        }
    },
    @{
        Method = "PUT"
        Path = "/v1/admin/users/{id}"
        Description = "Update user"
        TestId = "user-001"
        Body = @{
            name = "Updated Name"
            role = "User"
        }
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 200
        }
    },
    @{
        Method = "DELETE"
        Path = "/v1/admin/users/{id}"
        Description = "Delete user"
        TestId = "user-001"
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 204
        }
    },
    @{
        Method = "PUT"
        Path = "/v1/admin/users/{id}/ban"
        Description = "Ban user"
        TestId = "user-001"
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 200
        }
    },
    @{
        Method = "PUT"
        Path = "/v1/admin/users/{id}/unban"
        Description = "Unban user"
        TestId = "user-001"
        ExpectedAccess = @{
            Anonymous = 401
            User = 403
            Contributor = 403
            Admin = 200
        }
    }
)

# Helper function to make HTTP request
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Token,
        [object]$Body
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $headers
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }
        
        if ($Body -and ($Method -eq "POST" -or $Method -eq "PUT")) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        return @{
            StatusCode = $response.StatusCode
            Success = $true
        }
    } catch {
        return @{
            StatusCode = $_.Exception.Response.StatusCode.value__
            Success = $false
        }
    }
}

# Login users to get tokens
Write-Host "Setting up test users..." -ForegroundColor Yellow

foreach ($userKey in @("User", "Contributor", "Admin")) {
    $user = $TestUsers[$userKey]
    
    Write-Host "  Logging in as $($user.Role)..." -ForegroundColor Cyan
    
    $loginBody = @{
        email = $user.Email
        name = $user.Name
        provider = "email"
    }
    
    try {
        $response = Invoke-RestMethod -Method POST -Uri "$BaseUrl/v1/auth/login" `
            -Body ($loginBody | ConvertTo-Json) `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        $TestUsers[$userKey].Token = $response.accessToken
        Write-Host "    ✓ Logged in successfully" -ForegroundColor Green
        
        if ($Verbose) {
            Write-Host "      Token: $($response.accessToken.Substring(0, 20))..." -ForegroundColor Gray
        }
    } catch {
        Write-Host "    ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Skipping $userKey tests" -ForegroundColor Yellow
    }
}

Write-Host ""

# Run tests
Write-Host "Running RBAC tests..." -ForegroundColor Yellow
Write-Host ""

$testResults = @()
$totalTests = $Endpoints.Count * $TestUsers.Count
$passedTests = 0
$failedTests = 0

foreach ($endpoint in $Endpoints) {
    Write-Host "Testing: $($endpoint.Method) $($endpoint.Path)" -ForegroundColor Cyan
    Write-Host "  Description: $($endpoint.Description)" -ForegroundColor Gray
    Write-Host ""
    
    foreach ($userKey in $TestUsers.Keys) {
        $user = $TestUsers[$userKey]
        $expectedStatus = $endpoint.ExpectedAccess[$userKey]
        
        # Build URL
        $url = "$BaseUrl$($endpoint.Path)"
        if ($endpoint.TestId) {
            $url = $url -replace '\{id\}', $endpoint.TestId
        }
        
        # Make request
        $result = Invoke-ApiRequest -Method $endpoint.Method -Url $url -Token $user.Token -Body $endpoint.Body
        $actualStatus = $result.StatusCode
        
        # Check result
        $passed = $actualStatus -eq $expectedStatus
        
        if ($passed) {
            Write-Host "  ✓ $userKey : $actualStatus (expected $expectedStatus)" -ForegroundColor Green
            $passedTests++
        } else {
            Write-Host "  ✗ $userKey : $actualStatus (expected $expectedStatus)" -ForegroundColor Red
            $failedTests++
        }
        
        # Store result
        $testResults += [PSCustomObject]@{
            Endpoint = "$($endpoint.Method) $($endpoint.Path)"
            Role = $userKey
            Expected = $expectedStatus
            Actual = $actualStatus
            Status = if ($passed) { "✓ Pass" } else { "✗ Fail" }
        }
    }
    
    Write-Host ""
}

# Summary
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Statistics:" -ForegroundColor Cyan
Write-Host "  Total tests: $totalTests" -ForegroundColor Gray
Write-Host "  Passed: $passedTests" -ForegroundColor Green
Write-Host "  Failed: $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { 'Red' } else { 'Green' })
Write-Host "  Success rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" -ForegroundColor $(if ($failedTests -eq 0) { 'Green' } else { 'Yellow' })
Write-Host ""

# Show failed tests if any
if ($failedTests -gt 0) {
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "✗ Fail" } | Format-Table -AutoSize
    Write-Host ""
}

# Final verdict
if ($failedTests -eq 0) {
    Write-Host "✓ ALL RBAC TESTS PASSED" -ForegroundColor Green
    Write-Host "  All endpoints enforce correct role-based access control" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "✗ SOME RBAC TESTS FAILED" -ForegroundColor Red
    Write-Host "  Please review failed tests and fix authorization logic" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
