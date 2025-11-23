# Test Root Admin Login
# This script tests logging in as the root administrator

Write-Host "=== Testing Root Admin Login ===" -ForegroundColor Cyan
Write-Host ""

# API endpoint
$apiUrl = "http://localhost:7071/api/v1/auth/login"

# Root admin credentials
$loginData = @{
    email = "root@quotes.com"
    name = "Root Administrator"
    provider = "system"
} | ConvertTo-Json

Write-Host "Logging in as: root@quotes.com" -ForegroundColor Yellow
Write-Host "API Endpoint: $apiUrl" -ForegroundColor Yellow
Write-Host ""

try {
    # Make login request
    $response = Invoke-RestMethod -Uri $apiUrl `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -ErrorAction Stop

    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "User Details:" -ForegroundColor Cyan
    Write-Host "  ID:       $($response.user.id)"
    Write-Host "  Email:    $($response.user.email)"
    Write-Host "  Name:     $($response.user.name)"
    Write-Host "  Role:     $($response.user.role)" -ForegroundColor Green
    Write-Host "  Provider: $($response.user.provider)"
    Write-Host ""
    Write-Host "Token Info:" -ForegroundColor Cyan
    Write-Host "  Access Token:  $($response.accessToken.Substring(0, 50))..."
    Write-Host "  Refresh Token: $($response.refreshToken.Substring(0, 50))..."
    Write-Host "  Expires In:    $($response.expiresIn) seconds ($($response.expiresIn / 60) minutes)"
    Write-Host ""

    # Test authenticated request
    Write-Host "Testing authenticated request..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $($response.accessToken)"
        "Content-Type" = "application/json"
    }

    $userInfo = Invoke-RestMethod -Uri "http://localhost:7071/api/v1/users/me" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "✅ Authenticated Request Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current User Info:" -ForegroundColor Cyan
    Write-Host "  Email:      $($userInfo.email)"
    Write-Host "  Name:       $($userInfo.name)"
    Write-Host "  Role:       $($userInfo.role)" -ForegroundColor Green
    Write-Host "  Created:    $($userInfo.createdAt)"
    Write-Host "  Last Login: $($userInfo.lastLogin)"
    Write-Host ""

    Write-Host "🎉 Root Admin Login Test PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open http://localhost:3000 in your browser"
    Write-Host "  2. Login with: root@quotes.com"
    Write-Host "  3. You should have full admin access"
    Write-Host ""

} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    
    if ($_.ErrorDetails) {
        Write-Host "Response:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check if services are running: Get-Process | Where-Object { `$_.ProcessName -match 'func|azurite' }"
    Write-Host "  2. Check API health: curl http://localhost:7071/api/health"
    Write-Host "  3. Review function logs for errors"
    Write-Host "  4. Verify Azurite storage is initialized"
    Write-Host ""
}
