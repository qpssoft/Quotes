# Key Vault Verification Script
# Verifies all required secrets exist in Azure Key Vault

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'staging', 'production')]
    [string]$Environment = 'dev',
    
    [Parameter(Mandatory=$false)]
    [switch]$Detailed
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Azure Key Vault Verification Script" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$KeyVaultName = "quotes-kv-$Environment"
$ResourceGroup = "quotes-backend-rg-$Environment"

# Required secrets with their validation rules
$RequiredSecrets = @(
    @{
        Name = "JwtSecretKey"
        Required = $true
        MinLength = 32
        Description = "JWT signing key (256-bit minimum)"
    },
    @{
        Name = "JwtIssuer"
        Required = $true
        MinLength = 10
        Description = "JWT token issuer URL"
    },
    @{
        Name = "JwtAudience"
        Required = $true
        MinLength = 5
        Description = "JWT token audience"
    },
    @{
        Name = "JwtExpirationMinutes"
        Required = $false
        Pattern = '^\d+$'
        Description = "JWT expiration time in minutes"
    },
    @{
        Name = "AzureWebJobsStorage"
        Required = $true
        MinLength = 20
        Description = "Storage account connection string"
    },
    @{
        Name = "SendGridApiKey"
        Required = $false
        Pattern = '^(SG\.|$)'
        Description = "SendGrid API key (optional)"
    },
    @{
        Name = "ApplicationInsightsConnectionString"
        Required = $true
        MinLength = 50
        Description = "Application Insights connection string"
    }
)

# Check if logged in to Azure
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
try {
    $context = Get-AzContext -ErrorAction Stop
    if ($null -eq $context) {
        throw "Not logged in"
    }
    Write-Host "✓ Logged in as: $($context.Account)" -ForegroundColor Green
    Write-Host "  Subscription: $($context.Subscription.Name)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Not logged in to Azure" -ForegroundColor Red
    Write-Host "  Please run: Connect-AzAccount" -ForegroundColor Yellow
    exit 1
}

# Check if Key Vault exists
Write-Host "Checking Key Vault existence..." -ForegroundColor Yellow
try {
    $keyVault = Get-AzKeyVault -VaultName $KeyVaultName -ErrorAction Stop
    Write-Host "✓ Key Vault found: $KeyVaultName" -ForegroundColor Green
    Write-Host "  Resource Group: $($keyVault.ResourceGroupName)" -ForegroundColor Gray
    Write-Host "  Location: $($keyVault.Location)" -ForegroundColor Gray
    Write-Host "  Vault URI: $($keyVault.VaultUri)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Key Vault not found: $KeyVaultName" -ForegroundColor Red
    Write-Host "  Please create the Key Vault first using Bicep deployment" -ForegroundColor Yellow
    exit 1
}

# Check Key Vault access
Write-Host "Checking Key Vault access permissions..." -ForegroundColor Yellow
try {
    $secrets = Get-AzKeyVaultSecret -VaultName $KeyVaultName -ErrorAction Stop
    Write-Host "✓ Access granted (can list secrets)" -ForegroundColor Green
    Write-Host "  Total secrets in vault: $($secrets.Count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ No access to Key Vault" -ForegroundColor Red
    Write-Host "  Please grant access: Set-AzKeyVaultAccessPolicy -VaultName $KeyVaultName -UserPrincipalName <your-email> -PermissionsToSecrets Get,List" -ForegroundColor Yellow
    exit 1
}

# Verify each required secret
Write-Host "Verifying required secrets..." -ForegroundColor Yellow
Write-Host ""

$results = @()
$missingRequired = @()
$invalidSecrets = @()

foreach ($secret in $RequiredSecrets) {
    $secretName = $secret.Name
    $isRequired = $secret.Required
    
    Write-Host "  Checking: $secretName" -ForegroundColor Cyan
    
    try {
        $secretValue = Get-AzKeyVaultSecret -VaultName $KeyVaultName -Name $secretName -AsPlainText -ErrorAction Stop
        
        # Validate secret
        $isValid = $true
        $validationMessage = ""
        
        # Check minimum length
        if ($secret.MinLength -and $secretValue.Length -lt $secret.MinLength) {
            $isValid = $false
            $validationMessage = "Too short (min: $($secret.MinLength) chars, actual: $($secretValue.Length))"
        }
        
        # Check pattern
        if ($secret.Pattern -and $secretValue -notmatch $secret.Pattern) {
            $isValid = $false
            $validationMessage = "Invalid format (expected pattern: $($secret.Pattern))"
        }
        
        if ($isValid) {
            Write-Host "    ✓ Found and valid" -ForegroundColor Green
            if ($Detailed) {
                Write-Host "      Length: $($secretValue.Length) characters" -ForegroundColor Gray
                Write-Host "      Preview: $($secretValue.Substring(0, [Math]::Min(10, $secretValue.Length)))..." -ForegroundColor Gray
            }
            
            $results += [PSCustomObject]@{
                Secret = $secretName
                Status = "✓ Valid"
                Required = $isRequired
                Length = $secretValue.Length
                Message = "OK"
            }
        } else {
            Write-Host "    ✗ Invalid: $validationMessage" -ForegroundColor Red
            $invalidSecrets += $secretName
            
            $results += [PSCustomObject]@{
                Secret = $secretName
                Status = "✗ Invalid"
                Required = $isRequired
                Length = $secretValue.Length
                Message = $validationMessage
            }
        }
        
    } catch {
        if ($isRequired) {
            Write-Host "    ✗ Missing (REQUIRED)" -ForegroundColor Red
            $missingRequired += $secretName
            
            $results += [PSCustomObject]@{
                Secret = $secretName
                Status = "✗ Missing"
                Required = $true
                Length = 0
                Message = "Required secret not found"
            }
        } else {
            Write-Host "    ⚠ Missing (optional)" -ForegroundColor Yellow
            
            $results += [PSCustomObject]@{
                Secret = $secretName
                Status = "⚠ Missing"
                Required = $false
                Length = 0
                Message = "Optional secret not configured"
            }
        }
    }
    
    Write-Host "      $($secret.Description)" -ForegroundColor Gray
    Write-Host ""
}

# Summary
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Display results table
$results | Format-Table -AutoSize

Write-Host ""

# Calculate statistics
$totalSecrets = $RequiredSecrets.Count
$foundSecrets = ($results | Where-Object { $_.Status -like "*Valid*" }).Count
$requiredMissing = $missingRequired.Count
$invalidCount = $invalidSecrets.Count

Write-Host "Statistics:" -ForegroundColor Cyan
Write-Host "  Total required secrets: $totalSecrets" -ForegroundColor Gray
Write-Host "  Secrets found and valid: $foundSecrets" -ForegroundColor Green
Write-Host "  Required secrets missing: $requiredMissing" -ForegroundColor $(if ($requiredMissing -gt 0) { 'Red' } else { 'Green' })
Write-Host "  Invalid secrets: $invalidCount" -ForegroundColor $(if ($invalidCount -gt 0) { 'Red' } else { 'Green' })
Write-Host ""

# Final verdict
if ($requiredMissing -eq 0 -and $invalidCount -eq 0) {
    Write-Host "✓ VERIFICATION PASSED" -ForegroundColor Green
    Write-Host "  All required secrets are present and valid" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "✗ VERIFICATION FAILED" -ForegroundColor Red
    Write-Host ""
    
    if ($requiredMissing -gt 0) {
        Write-Host "Missing required secrets:" -ForegroundColor Red
        foreach ($secretName in $missingRequired) {
            $secret = $RequiredSecrets | Where-Object { $_.Name -eq $secretName }
            Write-Host "  - $secretName : $($secret.Description)" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($invalidCount -gt 0) {
        Write-Host "Invalid secrets:" -ForegroundColor Red
        foreach ($secretName in $invalidSecrets) {
            $result = $results | Where-Object { $_.Secret -eq $secretName }
            Write-Host "  - $secretName : $($result.Message)" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "Remediation:" -ForegroundColor Cyan
    Write-Host "  See KEY_VAULT_CONFIG.md for instructions on creating secrets" -ForegroundColor Yellow
    Write-Host "  Or run the setup script: .\setup-keyvault-secrets.ps1 -Environment $Environment" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
