# Build and Run React Native Windows App
# Usage: .\scripts\build-windows.ps1 [-Release] [-Launch]

param(
    [switch]$Release,
    [switch]$Launch
)

$ErrorActionPreference = "Stop"

Write-Host "🏗️  Building React Native Windows App..." -ForegroundColor Cyan

$config = if ($Release) { "Release" } else { "Debug" }
$launchFlag = if ($Launch) { "" } else { "--no-launch" }

Write-Host "Configuration: $config" -ForegroundColor Yellow
Write-Host "Launch app: $(if ($Launch) { 'Yes' } else { 'No' })" -ForegroundColor Yellow
Write-Host ""

# Change to quotes-native directory
Set-Location $PSScriptRoot\..

try {
    # Build the app
    if ($Release) {
        Write-Host "Building Release configuration..." -ForegroundColor Green
        npx @react-native-community/cli run-windows $launchFlag --arch x64 --release
    } else {
        Write-Host "Building Debug configuration..." -ForegroundColor Green
        npx @react-native-community/cli run-windows $launchFlag --arch x64
    }
    
    Write-Host ""
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    
    if (-not $Launch) {
        Write-Host ""
        Write-Host "To launch the app manually:" -ForegroundColor Cyan
        Write-Host "  cd windows\x64\$config\QuotesNative" -ForegroundColor White
        Write-Host "  .\QuotesNative.exe" -ForegroundColor White
        Write-Host ""
        Write-Host "Or run with launch:" -ForegroundColor Cyan
        Write-Host "  .\scripts\build-windows.ps1 -Launch" -ForegroundColor White
    }
} catch {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
