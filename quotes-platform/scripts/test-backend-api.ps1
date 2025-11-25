# Test Backend API Integration

Write-Host "Testing Quotes Backend API Integration..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$backendUrl = "http://localhost:7071/api/v1"
$quotesEndpoint = "$backendUrl/quotes"

# Test 1: Check if backend is running
Write-Host "[1/3] Testing backend availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $quotesEndpoint -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend is running on port 7071" -ForegroundColor Green
        $quotes = $response.Content | ConvertFrom-Json
        Write-Host "  Found $($quotes.Count) quotes" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Backend is not accessible" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd quotes-backend" -ForegroundColor Cyan
    Write-Host "  .\start-backend.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Test 2: Test filtered query
Write-Host "[2/3] Testing filtered query (Vietnamese quotes)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$quotesEndpoint?language=vi" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $viQuotes = $response.Content | ConvertFrom-Json
        Write-Host "✓ Filter by language works" -ForegroundColor Green
        Write-Host "  Found $($viQuotes.Count) Vietnamese quotes" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Filtered query failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Gray
}

Write-Host ""

# Test 3: Test single quote retrieval
Write-Host "[3/3] Testing single quote retrieval..." -ForegroundColor Yellow
try {
    # Get first quote ID from the list
    $response = Invoke-WebRequest -Uri $quotesEndpoint -Method GET -TimeoutSec 5 -UseBasicParsing
    $quotes = $response.Content | ConvertFrom-Json
    
    if ($quotes.Count -gt 0) {
        $firstQuoteId = $quotes[0].Id
        $singleQuoteResponse = Invoke-WebRequest -Uri "$quotesEndpoint/$firstQuoteId" -Method GET -TimeoutSec 5 -UseBasicParsing
        
        if ($singleQuoteResponse.StatusCode -eq 200) {
            $quote = $singleQuoteResponse.Content | ConvertFrom-Json
            Write-Host "✓ Single quote retrieval works" -ForegroundColor Green
            Write-Host "  Quote: $($quote.Content.Substring(0, [Math]::Min(50, $quote.Content.Length)))..." -ForegroundColor Gray
            Write-Host "  Author: $($quote.Author)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "✗ Single quote retrieval failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Backend API test complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now start the Angular app:" -ForegroundColor Yellow
Write-Host "  cd quotes-platform" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "The app will automatically connect to the backend API." -ForegroundColor Gray
