# Azure Key Vault Configuration - Quotes Backend

**Last Updated**: November 24, 2025  
**Environment**: Development / Staging / Production

## Overview

This document outlines the Azure Key Vault configuration for the Quotes Backend API, including all required secrets, their purposes, and management procedures.

## Key Vault Resources

### Development
- **Name**: `quotes-kv-dev`
- **Resource Group**: `quotes-backend-rg-dev`
- **Location**: East US
- **SKU**: Standard

### Staging
- **Name**: `quotes-kv-staging`
- **Resource Group**: `quotes-backend-rg-staging`
- **Location**: East US
- **SKU**: Standard

### Production
- **Name**: `quotes-kv-production`
- **Resource Group**: `quotes-backend-rg-production`
- **Location**: East US
- **SKU**: Standard (consider Premium for HSM-backed keys)

## Required Secrets

### 1. JWT Authentication Secrets

#### JwtSecretKey
- **Purpose**: Signing key for JWT access tokens
- **Type**: String (256-bit minimum)
- **Required**: ✅ Yes
- **Environment Variable**: `JwtSecretKey`
- **Default (Dev)**: `your-256-bit-secret-key-here-change-in-production-min-32-chars`
- **Production Requirements**:
  - Minimum 32 characters (256 bits)
  - Cryptographically random
  - Rotated every 90 days
- **Generation Command**:
  ```powershell
  # Generate secure 256-bit key
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
  ```
- **Key Vault Reference**: `@Microsoft.KeyVault(SecretUri=https://quotes-kv-{env}.vault.azure.net/secrets/JwtSecretKey/)`

#### JwtIssuer
- **Purpose**: JWT token issuer identifier
- **Type**: String (URL)
- **Required**: ✅ Yes
- **Environment Variable**: `JwtIssuer`
- **Development**: `https://localhost:7071`
- **Staging**: `https://quotes-func-staging.azurewebsites.net`
- **Production**: `https://quotes-api.azurewebsites.net`
- **Key Vault Reference**: `@Microsoft.KeyVault(SecretUri=https://quotes-kv-{env}.vault.azure.net/secrets/JwtIssuer/)`

#### JwtAudience
- **Purpose**: JWT token audience identifier
- **Type**: String
- **Required**: ✅ Yes
- **Environment Variable**: `JwtAudience`
- **Value**: `quotes-api-clients`
- **Key Vault Reference**: `@Microsoft.KeyVault(SecretUri=https://quotes-kv-{env}.vault.azure.net/secrets/JwtAudience/)`

#### JwtExpirationMinutes
- **Purpose**: JWT access token expiration time
- **Type**: Integer (minutes)
- **Required**: ⚠️ Optional (default: 60)
- **Environment Variable**: `JwtExpirationMinutes`
- **Development**: `60` (1 hour)
- **Production**: `15` (15 minutes for tighter security)
- **Key Vault Reference**: `@Microsoft.KeyVault(SecretUri=https://quotes-kv-{env}.vault.azure.net/secrets/JwtExpirationMinutes/)`

### 2. Azure Storage Secrets

#### AzureWebJobsStorage
- **Purpose**: Azure Functions storage account connection string
- **Type**: Connection String
- **Required**: ✅ Yes
- **Environment Variable**: `AzureWebJobsStorage`
- **Development**: `UseDevelopmentStorage=true` (Azurite)
- **Production Format**: `DefaultEndpointsProtocol=https;AccountName={account};AccountKey={key};EndpointSuffix=core.windows.net`
- **Key Vault Reference**: `@Microsoft.KeyVault(SecretUri=https://quotes-kv-{env}.vault.azure.net/secrets/AzureWebJobsStorage/)`
- **Note**: For production, use Managed Identity instead of connection string

### 3. Email Service Secrets

#### SendGridApiKey
- **Purpose**: SendGrid API key for sending emails (notifications, password resets, etc.)
- **Type**: String (API Key)
- **Required**: ⚠️ Optional (empty string if not configured)
- **Environment Variable**: `SendGridApiKey`
- **Development**: `""` (empty, logging only)
- **Production**: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Key Vault Reference**: `@Microsoft.KeyVault(SecretUri=https://quotes-kv-{env}.vault.azure.net/secrets/SendGridApiKey/)`
- **Obtain From**: [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys)

### 4. Application Insights Secrets

#### APPLICATIONINSIGHTS_CONNECTION_STRING
- **Purpose**: Application Insights connection string for telemetry
- **Type**: Connection String
- **Required**: ✅ Yes (for monitoring)
- **Environment Variable**: `APPLICATIONINSIGHTS_CONNECTION_STRING`
- **Format**: `InstrumentationKey={guid};IngestionEndpoint=https://{region}.in.applicationinsights.azure.com/;LiveEndpoint=https://{region}.livediagnostics.monitor.azure.com/`
- **Key Vault Reference**: `@Microsoft.KeyVault(SecretUri=https://quotes-kv-{env}.vault.azure.net/secrets/ApplicationInsightsConnectionString/)`
- **Obtain From**: Azure Portal → Application Insights → Properties

### 5. Key Vault Configuration

#### KeyVaultUri
- **Purpose**: URI to access Key Vault for runtime secret retrieval
- **Type**: String (URL)
- **Required**: ⚠️ Optional (for local dev)
- **Environment Variable**: `KeyVaultUri`
- **Development**: Empty (not needed with local.settings.json)
- **Staging**: `https://quotes-kv-staging.vault.azure.net/`
- **Production**: `https://quotes-kv-production.vault.azure.net/`
- **Note**: Not stored in Key Vault itself

### 6. OAuth Provider Secrets (Future)

#### AzureAdB2C-ClientId
- **Purpose**: Azure AD B2C application client ID
- **Type**: String (GUID)
- **Required**: ❌ No (not yet implemented)
- **Status**: Placeholder for T074
- **Key Vault Reference**: `@Microsoft.KeyVault(SecretUri=https://quotes-kv-{env}.vault.azure.net/secrets/AzureAdB2C-ClientId/)`

#### AzureAdB2C-ClientSecret
- **Purpose**: Azure AD B2C application client secret
- **Type**: String
- **Required**: ❌ No (not yet implemented)
- **Status**: Placeholder for T074
- **Key Vault Reference**: `@Microsoft.KeyVault(SecretUri=https://quotes-kv-{env}.vault.azure.net/secrets/AzureAdB2C-ClientSecret/)`

#### AzureAdB2C-TenantId
- **Purpose**: Azure AD B2C tenant ID
- **Type**: String (GUID)
- **Required**: ❌ No (not yet implemented)
- **Status**: Placeholder for T074

## Secret Management Procedures

### Creating Secrets in Key Vault

#### Using Azure CLI:
```bash
# Login
az login

# Set variables
ENVIRONMENT="dev"
KEY_VAULT_NAME="quotes-kv-${ENVIRONMENT}"

# Create JWT secret
JWT_SECRET=$(openssl rand -base64 48)
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "JwtSecretKey" --value "$JWT_SECRET"

# Create JWT configuration
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "JwtIssuer" --value "https://quotes-func-${ENVIRONMENT}.azurewebsites.net"
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "JwtAudience" --value "quotes-api-clients"
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "JwtExpirationMinutes" --value "60"

# Create storage connection string (get from storage account)
STORAGE_CONN_STRING=$(az storage account show-connection-string --name "quotesstorage${ENVIRONMENT}" --resource-group "quotes-backend-rg-${ENVIRONMENT}" --query connectionString -o tsv)
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "AzureWebJobsStorage" --value "$STORAGE_CONN_STRING"

# Create SendGrid API key (replace with actual key)
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "SendGridApiKey" --value "SG.your_api_key_here"

# Create Application Insights connection string (get from App Insights)
APP_INSIGHTS_CONN=$(az monitor app-insights component show --app "quotes-insights-${ENVIRONMENT}" --resource-group "quotes-backend-rg-${ENVIRONMENT}" --query connectionString -o tsv)
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "ApplicationInsightsConnectionString" --value "$APP_INSIGHTS_CONN"
```

#### Using PowerShell:
```powershell
# Login
Connect-AzAccount

# Set variables
$Environment = "dev"
$KeyVaultName = "quotes-kv-$Environment"

# Create JWT secret
$JwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Set-AzKeyVaultSecret -VaultName $KeyVaultName -Name "JwtSecretKey" -SecretValue (ConvertTo-SecureString $JwtSecret -AsPlainText -Force)

# Create JWT configuration
Set-AzKeyVaultSecret -VaultName $KeyVaultName -Name "JwtIssuer" -SecretValue (ConvertTo-SecureString "https://quotes-func-$Environment.azurewebsites.net" -AsPlainText -Force)
Set-AzKeyVaultSecret -VaultName $KeyVaultName -Name "JwtAudience" -SecretValue (ConvertTo-SecureString "quotes-api-clients" -AsPlainText -Force)
Set-AzKeyVaultSecret -VaultName $KeyVaultName -Name "JwtExpirationMinutes" -SecretValue (ConvertTo-SecureString "60" -AsPlainText -Force)
```

### Granting Access to Function App

#### Using Managed Identity (Recommended):
```bash
# Enable system-assigned managed identity
az functionapp identity assign --name "quotes-func-${ENVIRONMENT}" --resource-group "quotes-backend-rg-${ENVIRONMENT}"

# Get the principal ID
PRINCIPAL_ID=$(az functionapp identity show --name "quotes-func-${ENVIRONMENT}" --resource-group "quotes-backend-rg-${ENVIRONMENT}" --query principalId -o tsv)

# Grant Key Vault access
az keyvault set-policy --name $KEY_VAULT_NAME --object-id $PRINCIPAL_ID --secret-permissions get list
```

#### Using Access Policy:
```powershell
# Grant access to specific user/service principal
Set-AzKeyVaultAccessPolicy -VaultName $KeyVaultName -ObjectId "<principal-id>" -PermissionsToSecrets Get,List
```

### Configuring Function App to Use Key Vault

Add to Function App Configuration (Application Settings):

```
@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/JwtSecretKey/)
@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/JwtIssuer/)
@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/JwtAudience/)
@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/AzureWebJobsStorage/)
@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/SendGridApiKey/)
@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/ApplicationInsightsConnectionString/)
```

## Secret Rotation Schedule

| Secret | Rotation Frequency | Owner | Notes |
|--------|-------------------|-------|-------|
| JwtSecretKey | 90 days | DevOps Team | Coordinate with active sessions |
| AzureWebJobsStorage | On compromise | Azure Admin | Use Managed Identity instead |
| SendGridApiKey | 180 days | DevOps Team | Rotate if suspicious activity |
| ApplicationInsights | Never | Azure Admin | Auto-managed by Azure |
| OAuth ClientSecret | 365 days | Security Team | When implementing OAuth |

## Security Best Practices

### ✅ Implemented
- Soft delete enabled (7-day retention)
- Template deployment enabled
- Secrets never committed to repository
- Local development uses local.settings.json (in .gitignore)

### 🔄 Recommended for Production
- Enable Azure RBAC authorization (instead of access policies)
- Enable purge protection
- Enable Azure Private Link
- Use Managed Identity for Function App (avoid connection strings)
- Enable diagnostic logging
- Set up Azure Monitor alerts for secret access
- Implement secret versioning strategy
- Document secret owners and rotation procedures

### ❌ Not Recommended
- Storing secrets in code or configuration files
- Using access keys instead of Managed Identity
- Sharing secrets via email or chat
- Disabling soft delete or purge protection

## Verification Checklist

Before deploying to production:

- [ ] All required secrets exist in Key Vault
- [ ] Function App has Managed Identity enabled
- [ ] Function App has Key Vault access policy configured
- [ ] JWT secret is cryptographically random (256-bit minimum)
- [ ] Storage account uses Managed Identity (not connection string)
- [ ] SendGrid API key is valid and tested
- [ ] Application Insights connection string is correct
- [ ] Soft delete is enabled
- [ ] Diagnostic logging is configured
- [ ] Secret rotation schedule is documented
- [ ] Incident response procedures are in place

## Local Development Configuration

For local development, secrets are stored in `local.settings.json` (NOT committed to git):

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "JwtSecretKey": "your-dev-secret-change-in-production",
    "JwtIssuer": "https://localhost:7071",
    "JwtAudience": "quotes-api-clients",
    "JwtExpirationMinutes": "60",
    "SendGridApiKey": "",
    "KeyVaultUri": ""
  }
}
```

**Note**: `local.settings.json` is in `.gitignore` and never committed to the repository.

## Troubleshooting

### Function App Cannot Access Key Vault

**Symptoms**: 
- Function fails to start
- Error: "The user, group or application does not have secrets get permission"

**Solutions**:
1. Verify Managed Identity is enabled
2. Check Key Vault access policy includes the Function App's principal ID
3. Ensure Key Vault reference syntax is correct
4. Verify network access (if using Private Link)

### Secret Not Found

**Symptoms**:
- Application uses default values
- Warning: "Secret 'xxx' not found in Key Vault"

**Solutions**:
1. Verify secret name matches exactly (case-sensitive)
2. Check secret is not disabled or expired
3. Verify Key Vault URI is correct
4. Ensure secret has been created

### Invalid JWT Secret

**Symptoms**:
- Token validation fails
- Error: "Invalid signature"

**Solutions**:
1. Verify JWT secret is at least 32 characters
2. Check secret hasn't been rotated without restarting the app
3. Ensure no whitespace in secret value
4. Verify secret is Base64-encoded if required

## Support

For Key Vault issues:
- **Azure Portal**: [https://portal.azure.com](https://portal.azure.com)
- **Documentation**: [https://learn.microsoft.com/azure/key-vault](https://learn.microsoft.com/azure/key-vault)
- **Support**: Create Azure Support ticket

For application secret management:
- See: `SECURITY_SCAN_REPORT.md`
- Contact: DevOps Team

---

**Document Version**: 1.0  
**Last Review**: November 24, 2025  
**Next Review**: Before production deployment
