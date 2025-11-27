# Quotes Backend Deployment Script
# Deploys Azure infrastructure and Function App to Azure

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'staging', 'production')]
    [string]$Environment = 'dev',
    
    [Parameter(Mandatory=$false)]
    [string]$Location = 'eastus',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipInfrastructure,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipFunctionDeploy,
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Step { Write-Host "`n==> $args" -ForegroundColor Cyan }
function Write-Success { Write-Host "[OK] $args" -ForegroundColor Green }
function Write-Warning-Custom { Write-Host "[WARN] $args" -ForegroundColor Yellow }
function Write-Error-Custom { Write-Host "[ERR] $args" -ForegroundColor Red }
function Write-Info { Write-Host "  $args" -ForegroundColor Gray }

# Script directory
$ScriptDir = $PSScriptRoot
$RootDir = Split-Path $ScriptDir -Parent
$BackendDir = Join-Path $RootDir "quotes-backend"
$FunctionsDir = Join-Path $BackendDir "src\Quotes.Functions"

Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║           Quotes Backend - Azure Deployment Script            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Info "Environment: $Environment"
Write-Info "Location: $Location"
Write-Info "WhatIf Mode: $WhatIf"
Write-Info ""

# ============================================================================
# Step 1: Prerequisites Check
# ============================================================================

Write-Step "Checking prerequisites..."

# Check Azure CLI
try {
    # Try direct az command first
    $azVersion = $null
    $azTest = Get-Command az -ErrorAction SilentlyContinue
    if ($azTest) {
        $azVersionOutput = & az version --output json 2>&1
        if ($LASTEXITCODE -eq 0) {
            $azVersion = ($azVersionOutput | ConvertFrom-Json).'azure-cli'
        }
    }
    
    if ($azVersion) {
        Write-Success "Azure CLI installed (version $azVersion)"
    } else {
        Write-Error-Custom "Azure CLI not working properly. Try: az login"
        exit 1
    }
} catch {
    Write-Error-Custom "Azure CLI not installed. Install from: https://aka.ms/installazurecliwindows"
    exit 1
}

# Check if logged in
try {
    $accountOutput = & az account show --output json 2>&1
    if ($LASTEXITCODE -eq 0) {
        $account = $accountOutput | ConvertFrom-Json
        Write-Success "Logged in to Azure"
        Write-Info "Subscription: $($account.name) ($($account.id))"
        Write-Info "Tenant: $($account.tenantId)"
    } else {
        Write-Error-Custom "Not logged in to Azure"
        Write-Warning-Custom "Run: az login"
        exit 1
    }
} catch {
    Write-Error-Custom "Not logged in to Azure"
    Write-Warning-Custom "Run: az login"
    exit 1
}

# Check .NET SDK
try {
    $dotnetVersion = dotnet --version
    Write-Success ".NET SDK installed (version $dotnetVersion)"
} catch {
    Write-Error-Custom ".NET SDK not installed. Install from: https://dotnet.microsoft.com/download"
    exit 1
}

# Check Azure Functions Core Tools
try {
    $funcVersion = func --version
    Write-Success "Azure Functions Core Tools installed (version $funcVersion)"
} catch {
    Write-Error-Custom "Azure Functions Core Tools not installed"
    Write-Warning-Custom "Run: npm install -g azure-functions-core-tools@4 --unsafe-perm true"
    exit 1
}

if ($WhatIf) {
    Write-Warning-Custom "WhatIf mode enabled - no actual deployment will occur"
}

# ============================================================================
# Step 2: Deploy Infrastructure (Bicep)
# ============================================================================

if (-not $SkipInfrastructure) {
    Write-Step "Deploying Azure infrastructure..."
    
    $deploymentName = "quotes-backend-deployment-$Environment-$(Get-Date -Format 'yyyyMMddHHmmss')"
    $bicepFile = Join-Path $ScriptDir "main.bicep"
    $parametersFile = Join-Path $ScriptDir "parameters\$Environment.parameters.json"
    # Derive resource group name (required param for main.bicep)
    $resourceGroupNameParam = "quotes-backend-rg-$Environment"
    
    if (-not (Test-Path $bicepFile)) {
        Write-Error-Custom "Bicep file not found: $bicepFile"
        exit 1
    }
    
    Write-Info "Deployment name: $deploymentName"
    Write-Info "Bicep file: $bicepFile"
    Write-Info "Parameters file: $parametersFile"
    
    # Build Bicep to check for errors
    Write-Info "Validating Bicep template..."
    $env:AZURE_CORE_ONLY_SHOW_ERRORS = "True"
    $bicepValidation = az bicep build --file $bicepFile --stdout --only-show-errors 2>&1
    $env:AZURE_CORE_ONLY_SHOW_ERRORS = $null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Bicep template is valid"
    } else {
        Write-Error-Custom "Bicep validation failed"
        Write-Error-Custom ($bicepValidation | Out-String)
        exit 1
    }
    
    if ($WhatIf) {
        Write-Info "Would deploy infrastructure with:"
        Write-Info "  az deployment sub create \"
        Write-Info "    --name $deploymentName \"
        Write-Info "    --location $Location \"
        Write-Info "    --template-file $bicepFile \"
        Write-Info "    --parameters environment=$Environment location=$Location resourceGroupName=$resourceGroupNameParam"
    } else {
        # Deploy infrastructure
        Write-Info "Starting deployment (this may take 5-10 minutes)..."
        
        $deployResult = az deployment sub create `
            --name $deploymentName `
            --location $Location `
            --template-file $bicepFile `
            --parameters environment=$Environment location=$Location resourceGroupName=$resourceGroupNameParam `
            --only-show-errors `
            --output json 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $deployment = $deployResult | ConvertFrom-Json
            Write-Success "Infrastructure deployed successfully"
            
            # Extract outputs
            $outputs = $deployment.properties.outputs
            $resourceGroupName = $outputs.resourceGroupName.value
            $storageAccountName = $outputs.storageAccountName.value
            $functionAppName = $outputs.functionAppName.value
            $keyVaultName = $outputs.keyVaultName.value
            
            Write-Info "Resource Group: $resourceGroupName"
            Write-Info "Storage Account: $storageAccountName"
            Write-Info "Function App: $functionAppName"
            Write-Info "Key Vault: $keyVaultName"
            
            # Save outputs to file
            $outputFile = Join-Path $ScriptDir "deployment-outputs-$Environment.json"
            $outputs | ConvertTo-Json -Depth 10 | Out-File $outputFile -Encoding UTF8
            Write-Success "Deployment outputs saved to: $outputFile"
            
        } else {
            Write-Error-Custom "Infrastructure deployment failed"
            Write-Error-Custom $deployResult
            exit 1
        }
    }
} else {
    Write-Warning-Custom "Skipping infrastructure deployment"
    
    # Load outputs from previous deployment
    $outputFile = Join-Path $ScriptDir "deployment-outputs-$Environment.json"
    if (Test-Path $outputFile) {
        $outputs = Get-Content $outputFile | ConvertFrom-Json
        $resourceGroupName = $outputs.resourceGroupName.value
        $functionAppName = $outputs.functionAppName.value
        $keyVaultName = $outputs.keyVaultName.value
        Write-Info "Loaded outputs from: $outputFile"
    } else {
        Write-Error-Custom "No deployment outputs found. Run without -SkipInfrastructure first."
        exit 1
    }
}

# ============================================================================
# Step 3: Configure Key Vault Secrets
# ============================================================================

Write-Step "Configuring Key Vault secrets..."

if ($WhatIf) {
    Write-Info "Would configure Key Vault secrets"
} else {
    # Check if secrets exist
    $existingSecrets = az keyvault secret list --vault-name $keyVaultName --query "[].name" -o json | ConvertFrom-Json
    
    # Storage Connection String
    if ($existingSecrets -notcontains "StorageConnectionString") {
        Write-Info "Adding StorageConnectionString to Key Vault..."
        $storageConnection = az storage account show-connection-string `
            --name $storageAccountName `
            --resource-group $resourceGroupName `
            --query connectionString -o tsv
        
        az keyvault secret set `
            --vault-name $keyVaultName `
            --name StorageConnectionString `
            --value $storageConnection `
            --output none
        Write-Success "StorageConnectionString added"
    } else {
        Write-Success "StorageConnectionString already exists"
    }
    
    # JWT Secret
    if ($existingSecrets -notcontains "JwtSecret") {
        Write-Info "Generating and adding JwtSecret to Key Vault..."
        $jwtSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
        
        az keyvault secret set `
            --vault-name $keyVaultName `
            --name JwtSecret `
            --value $jwtSecret `
            --output none
        Write-Success "JwtSecret added"
    } else {
        Write-Success "JwtSecret already exists"
    }
    
    Write-Success "Key Vault configuration complete"
}

# ============================================================================
# Step 4: Build and Deploy Function App
# ============================================================================

if (-not $SkipFunctionDeploy) {
    Write-Step "Building Function App..."
    
    if (-not (Test-Path $FunctionsDir)) {
        Write-Error-Custom "Functions directory not found: $FunctionsDir"
        exit 1
    }
    
    Push-Location $FunctionsDir
    try {
        # Restore packages
        Write-Info "Restoring NuGet packages..."
        dotnet restore --verbosity quiet
        if ($LASTEXITCODE -ne 0) {
            throw "dotnet restore failed"
        }
        Write-Success "Packages restored"
        
        # Build
        Write-Info "Building project..."
        dotnet build --configuration Release --no-restore --verbosity quiet
        if ($LASTEXITCODE -ne 0) {
            throw "dotnet build failed"
        }
        Write-Success "Build successful"
        
        # Publish
        Write-Info "Publishing project..."
        $publishDir = Join-Path $FunctionsDir "publish"
        if (Test-Path $publishDir) {
            Remove-Item $publishDir -Recurse -Force
        }
        dotnet publish --configuration Release --output $publishDir --no-build --verbosity quiet
        if ($LASTEXITCODE -ne 0) {
            throw "dotnet publish failed"
        }
        Write-Success "Publish successful"
        
        # Create zip
        Write-Info "Creating deployment package..."
        $zipFile = Join-Path $FunctionsDir "quotes-functions.zip"
        if (Test-Path $zipFile) {
            Remove-Item $zipFile -Force
        }
        
        Push-Location $publishDir
        Compress-Archive -Path * -DestinationPath $zipFile -Force
        Pop-Location
        
        Write-Success "Deployment package created: $zipFile"
        
        if (-not $WhatIf) {
            # Deploy to Azure
            Write-Step "Deploying to Azure Functions..."
            Write-Info "Function App: $functionAppName"
            Write-Info "This may take 2-3 minutes..."
            
            az functionapp deployment source config-zip `
                --name $functionAppName `
                --resource-group $resourceGroupName `
                --src $zipFile `
                --output none
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Function App deployed successfully"
                
                # Get Function App URL
                $functionAppUrl = az functionapp show `
                    --name $functionAppName `
                    --resource-group $resourceGroupName `
                    --query defaultHostName -o tsv
                
                Write-Info "Function App URL: https://$functionAppUrl"
                
                # Wait for app to warm up
                Write-Info "Waiting for Function App to warm up (30 seconds)..."
                Start-Sleep -Seconds 30
                
                # Test health endpoint
                Write-Info "Testing health endpoint..."
                try {
                    $healthUrl = "https://$functionAppUrl/api/v1/health"
                    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 30
                    Write-Success "Health check passed: $($response.status)"
                } catch {
                    Write-Warning-Custom "Health check failed (app may still be warming up): $_"
                }
                
            } else {
                Write-Error-Custom "Function App deployment failed"
                exit 1
            }
        } else {
            Write-Info "Would deploy $zipFile to Function App: $functionAppName"
        }
        
    } finally {
        Pop-Location
    }
} else {
    Write-Warning-Custom "Skipping Function App deployment"
}

# ============================================================================
# Deployment Summary
# ============================================================================

Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                   Deployment Complete! 🎉                     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

if (-not $WhatIf) {
    Write-Host "Environment: " -NoNewline
    Write-Host $Environment -ForegroundColor Yellow
    
    Write-Host "`nResources Created:" -ForegroundColor Cyan
    Write-Host "  • Resource Group: " -NoNewline -ForegroundColor Gray
    Write-Host $resourceGroupName -ForegroundColor White
    Write-Host "  • Function App: " -NoNewline -ForegroundColor Gray
    Write-Host $functionAppName -ForegroundColor White
    Write-Host "  • Key Vault: " -NoNewline -ForegroundColor Gray
    Write-Host $keyVaultName -ForegroundColor White
    
    Write-Host "`nAPI Endpoint:" -ForegroundColor Cyan
    Write-Host "  https://$functionAppUrl" -ForegroundColor White
    
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "  1. Configure Azure AD B2C (see docs/deployment.md)" -ForegroundColor Gray
    Write-Host "  2. Add OAuth secrets to Key Vault" -ForegroundColor Gray
    Write-Host "  3. Deploy Static Web App (quotes-admin)" -ForegroundColor Gray
    Write-Host "  4. Test API endpoints" -ForegroundColor Gray
    
    Write-Host "`nUseful Commands:" -ForegroundColor Cyan
    Write-Host "  # View Function App logs" -ForegroundColor Gray
    Write-Host "  az webapp log tail --name $functionAppName --resource-group $resourceGroupName" -ForegroundColor Yellow
    
    Write-Host "`n  # Test API endpoint" -ForegroundColor Gray
    Write-Host "  curl https://$functionAppUrl/api/v1/quotes" -ForegroundColor Yellow
    
    Write-Host "`n  # Open in Azure Portal" -ForegroundColor Gray
    Write-Host "  az functionapp show --name $functionAppName --resource-group $resourceGroupName --query id -o tsv | % { start `"https://portal.azure.com/#resource/$_`" }" -ForegroundColor Yellow
    
} else {
    Write-Info "This was a dry run. Use without -WhatIf to actually deploy."
}

Write-Host ""
