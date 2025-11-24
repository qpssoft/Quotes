# Azure Backend Deployment Guide

Complete guide for deploying the Quotes Backend to Azure using Bicep Infrastructure as Code.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Deployment Steps](#deployment-steps)
- [Azure AD B2C Setup](#azure-ad-b2c-setup)
- [Key Vault Configuration](#key-vault-configuration)
- [Function App Deployment](#function-app-deployment)
- [Static Web App Deployment](#static-web-app-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Environment Management](#environment-management)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

Install these tools before proceeding:

```bash
# Azure CLI (minimum version 2.50.0)
az --version

# If not installed:
# Windows (via winget):
winget install -e --id Microsoft.AzureCLI

# Or download from:
# https://aka.ms/installazurecliwindows

# .NET SDK 8.0
dotnet --version

# If not installed, download from:
# https://dotnet.microsoft.com/download/dotnet/8.0

# Azure Functions Core Tools v4
func --version

# If not installed:
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Node.js 20.x or later
node --version

# If not installed, download from:
# https://nodejs.org/
```

### Azure Subscription

You need:
- Active Azure subscription
- Subscription ID (run `az account show --query id -o tsv`)
- Owner or Contributor role on the subscription
- Ability to create Azure AD B2C tenants

### Register Resource Providers

```bash
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.Storage
az provider register --namespace Microsoft.KeyVault
az provider register --namespace Microsoft.AppConfiguration
az provider register --namespace Microsoft.Insights
az provider register --namespace Microsoft.AzureActiveDirectory
```

---

## Architecture Overview

The deployment creates these Azure resources:

```
Azure Subscription
├── Resource Group (quotes-backend-rg-{env})
│   ├── Storage Account (quotes-storage-{env})
│   │   ├── Blob Containers: quotes, users, categories
│   │   └── Queue: quote-moderation-queue
│   ├── Key Vault (quotes-kv-{env})
│   │   ├── Secrets: StorageConnection, JwtSecret, OAuth keys
│   │   └── Access Policies: Function App, Admin users
│   ├── App Configuration (quotes-appconfig-{env})
│   │   └── Feature flags, environment settings
│   ├── Application Insights (quotes-ai-{env})
│   │   └── Monitoring, telemetry, logs
│   ├── Function App (quotes-func-{env})
│   │   ├── HTTP Triggers: Auth, Quotes, Admin, Users
│   │   └── System-assigned Managed Identity
│   └── Static Web App (quotes-admin-{env})
│       └── Admin Center React app
└── Azure AD B2C Tenant (quotesb2c{env})
    ├── User Flows: Sign-up/Sign-in
    ├── Identity Providers: Email, Google, Facebook
    └── App Registrations: Admin Center, Mobile Apps
```

**Estimated Monthly Cost:**
- **Dev Environment:** $5-10/month
- **Production Environment:** $15-20/month (for 10K users)

---

## Deployment Steps

### Step 1: Clone Repository

```bash
git clone https://github.com/qpssoft/Quotes.git
cd Quotes
```

### Step 2: Login to Azure

```bash
# Login interactively
az login

# Select subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Verify current subscription
az account show
```

### Step 3: Configure Parameters

Create parameter files for each environment:

**infrastructure/parameters/dev.bicepparam**
```bicep
using '../main.bicep'

param environment = 'dev'
param location = 'eastus'
param resourceGroupName = 'quotes-backend-rg-dev'
```

**infrastructure/parameters/production.bicepparam**
```bicep
using '../main.bicep'

param environment = 'production'
param location = 'eastus'
param resourceGroupName = 'quotes-backend-rg-production'
```

### Step 4: Deploy Infrastructure (Dev Environment)

```bash
# Navigate to infrastructure folder
cd infrastructure

# Deploy using Bicep
az deployment sub create \
  --name quotes-backend-deployment-dev \
  --location eastus \
  --template-file main.bicep \
  --parameters parameters/dev.bicepparam

# Wait for deployment (5-10 minutes)
```

**Expected Output:**
```json
{
  "properties": {
    "provisioningState": "Succeeded",
    "outputs": {
      "storageAccountName": "quotesstoragedev",
      "keyVaultName": "quotes-kv-dev",
      "functionAppName": "quotes-func-dev",
      "staticWebAppName": "quotes-admin-dev"
    }
  }
}
```

### Step 5: Save Deployment Outputs

```bash
# Get deployment outputs
az deployment sub show \
  --name quotes-backend-deployment-dev \
  --query properties.outputs

# Save to file
az deployment sub show \
  --name quotes-backend-deployment-dev \
  --query properties.outputs > deployment-outputs-dev.json
```

---

## Azure AD B2C Setup

Azure AD B2C provides authentication for users.

### Step 1: Create B2C Tenant

```bash
# Create B2C tenant
az ad b2c create \
  --display-name "Quotes B2C Dev" \
  --name quotesb2cdev \
  --location global
```

Or via Azure Portal:
1. Go to **Create a resource** → **Azure Active Directory B2C**
2. Select **Create a new Azure AD B2C Tenant**
3. Organization name: `Quotes B2C Dev`
4. Initial domain name: `quotesb2cdev`
5. Click **Create**

### Step 2: Register Application

Via Azure Portal (recommended):

1. Switch to B2C directory (top-right tenant switcher)
2. Go to **Azure AD B2C** → **App registrations** → **New registration**
3. **Name:** `Quotes Admin Center`
4. **Supported account types:** Accounts in this organizational directory only
5. **Redirect URI:**
   - Platform: **Single-page application (SPA)**
   - URL: `http://localhost:3000` (dev)
   - Add: `https://quotes-admin-dev.azurestaticapps.net` (production)
6. Click **Register**
7. Copy **Application (client) ID**

### Step 3: Configure OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Quotes App"
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   https://quotesb2cdev.b2clogin.com/quotesb2cdev.onmicrosoft.com/oauth2/authresp
   ```
7. Copy **Client ID** and **Client Secret**

In Azure AD B2C:
1. Go to **Identity providers** → **Google**
2. Client ID: (paste from Google)
3. Client secret: (paste from Google)
4. Click **Save**

#### Facebook OAuth (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add **Facebook Login** product
4. Valid OAuth Redirect URIs:
   ```
   https://quotesb2cdev.b2clogin.com/quotesb2cdev.onmicrosoft.com/oauth2/authresp
   ```
5. Copy **App ID** and **App Secret**

In Azure AD B2C:
1. Go to **Identity providers** → **Facebook**
2. Client ID: (paste App ID)
3. Client secret: (paste App Secret)
4. Click **Save**

### Step 4: Create User Flow

1. Go to **User flows** → **New user flow**
2. Select **Sign up and sign in**
3. Version: **Recommended**
4. Name: `B2C_1_signupsignin`
5. Identity providers:
   - ☑ Email signup
   - ☑ Google (if configured)
   - ☑ Facebook (if configured)
6. User attributes and claims:
   - Collect: Email Address, Display Name, Given Name, Surname
   - Return: Email Addresses, Display Name, Object ID, User's Object ID
7. Click **Create**

### Step 5: Test User Flow

1. Click on `B2C_1_signupsignin` user flow
2. Click **Run user flow**
3. Reply URL: `https://jwt.ms` (for testing)
4. Click **Run user flow**
5. Sign up with a test email
6. Verify you receive JWT token at jwt.ms

---

## Key Vault Configuration

Store secrets securely in Azure Key Vault.

### Step 1: Get Key Vault Name

```bash
# From deployment outputs
KEY_VAULT_NAME=$(az deployment sub show \
  --name quotes-backend-deployment-dev \
  --query 'properties.outputs.keyVaultName.value' -o tsv)

echo $KEY_VAULT_NAME
```

### Step 2: Add Storage Connection String

```bash
# Get storage connection string
STORAGE_CONNECTION=$(az storage account show-connection-string \
  --name quotesstoragedev \
  --resource-group quotes-backend-rg-dev \
  --query connectionString -o tsv)

# Add to Key Vault
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name StorageConnectionString \
  --value "$STORAGE_CONNECTION"
```

### Step 3: Add JWT Secret

```bash
# Generate secure random JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# Add to Key Vault
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name JwtSecret \
  --value "$JWT_SECRET"
```

### Step 4: Add OAuth Secrets

```bash
# Azure AD B2C
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name AzureAdB2C--TenantId \
  --value "quotesb2cdev.onmicrosoft.com"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name AzureAdB2C--ClientId \
  --value "YOUR_B2C_CLIENT_ID"

# Google OAuth
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name Google--ClientId \
  --value "YOUR_GOOGLE_CLIENT_ID"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name Google--ClientSecret \
  --value "YOUR_GOOGLE_CLIENT_SECRET"

# Facebook OAuth (optional)
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name Facebook--AppId \
  --value "YOUR_FACEBOOK_APP_ID"

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name Facebook--AppSecret \
  --value "YOUR_FACEBOOK_APP_SECRET"
```

### Step 5: Grant Function App Access

```bash
# Get Function App principal ID
FUNCTION_APP_PRINCIPAL=$(az functionapp identity show \
  --name quotes-func-dev \
  --resource-group quotes-backend-rg-dev \
  --query principalId -o tsv)

# Grant Key Vault access
az keyvault set-policy \
  --name $KEY_VAULT_NAME \
  --object-id $FUNCTION_APP_PRINCIPAL \
  --secret-permissions get list
```

### Step 6: Verify Key Vault Secrets

```bash
# List all secrets
az keyvault secret list --vault-name $KEY_VAULT_NAME --query "[].name" -o table

# Expected secrets:
# - StorageConnectionString
# - JwtSecret
# - AzureAdB2C--TenantId
# - AzureAdB2C--ClientId
# - Google--ClientId
# - Google--ClientSecret
# - Facebook--AppId (optional)
# - Facebook--AppSecret (optional)
```

---

## Function App Deployment

Deploy the .NET Azure Functions application.

### Step 1: Build the Functions Project

```bash
cd quotes-backend/src/Quotes.Functions

# Restore NuGet packages
dotnet restore

# Build Release configuration
dotnet build --configuration Release

# Publish to folder
dotnet publish --configuration Release --output ./publish
```

### Step 2: Create Deployment Package

```bash
# Navigate to publish folder
cd publish

# Create zip file
# Windows (PowerShell):
Compress-Archive -Path * -DestinationPath ../quotes-functions.zip -Force

# Or use 7-Zip:
# 7z a -tzip ../quotes-functions.zip *

cd ..
```

### Step 3: Deploy to Azure Functions

```bash
# Deploy zip file
az functionapp deployment source config-zip \
  --name quotes-func-dev \
  --resource-group quotes-backend-rg-dev \
  --src quotes-functions.zip

# Wait for deployment (2-3 minutes)
```

### Step 4: Configure Function App Settings

```bash
# Set Key Vault reference for storage connection
az functionapp config appsettings set \
  --name quotes-func-dev \
  --resource-group quotes-backend-rg-dev \
  --settings AzureWebJobsStorage="@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/StorageConnectionString/)"

# Set JWT secret reference
az functionapp config appsettings set \
  --name quotes-func-dev \
  --resource-group quotes-backend-rg-dev \
  --settings JwtSecret="@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/JwtSecret/)"

# Set Azure AD B2C settings
az functionapp config appsettings set \
  --name quotes-func-dev \
  --resource-group quotes-backend-rg-dev \
  --settings \
    AzureAdB2C__TenantId="@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/AzureAdB2C--TenantId/)" \
    AzureAdB2C__ClientId="@Microsoft.KeyVault(SecretUri=https://quotes-kv-dev.vault.azure.net/secrets/AzureAdB2C--ClientId/)"
```

### Step 5: Verify Function App Deployment

```bash
# Get Function App URL
FUNCTION_APP_URL=$(az functionapp show \
  --name quotes-func-dev \
  --resource-group quotes-backend-rg-dev \
  --query defaultHostName -o tsv)

echo "Function App URL: https://$FUNCTION_APP_URL"

# Test health endpoint
curl "https://$FUNCTION_APP_URL/api/v1/health"

# Expected response:
# {"status":"healthy","timestamp":"2025-11-24T00:00:00Z"}

# Test public quotes endpoint
curl "https://$FUNCTION_APP_URL/api/v1/quotes"

# Should return array of quotes
```

### Step 6: Seed Initial Data (Optional)

```bash
# Run seed script locally pointing to Azure Storage
cd quotes-backend/scripts

# Update connection string in seed-data.ps1 to use Azure Storage
# Then run:
.\seed-data.ps1 -Environment dev
```

---

## Static Web App Deployment

Deploy the Admin Center React application to Azure Static Web Apps.

### Step 1: Build Admin Center

```bash
cd quotes-admin

# Install dependencies
npm install

# Create production .env file
cat > .env.production << EOF
REACT_APP_API_URL=https://quotes-func-dev.azurewebsites.net/api/v1
REACT_APP_MOCK_AUTH=false
REACT_APP_B2C_TENANT_NAME=quotesb2cdev
REACT_APP_B2C_CLIENT_ID=YOUR_B2C_CLIENT_ID
REACT_APP_B2C_POLICY_NAME=B2C_1_signupsignin
EOF

# Build for production
npm run build
```

### Step 2: Deploy to Static Web App

Via GitHub Actions (Recommended):

1. Get Static Web App deployment token:
   ```bash
   az staticwebapp secrets list \
     --name quotes-admin-dev \
     --resource-group quotes-backend-rg-dev \
     --query properties.apiKey -o tsv
   ```

2. Add GitHub secret:
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Add new secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV`
   - Value: (paste deployment token)

3. Create workflow file `.github/workflows/deploy-admin-dev.yml`:
   ```yaml
   name: Deploy Admin Center (Dev)
   
   on:
     push:
       branches: [main]
       paths:
         - 'quotes-admin/**'
   
   jobs:
     build_and_deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Build And Deploy
           uses: Azure/static-web-apps-deploy@v1
           with:
             azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
             repo_token: ${{ secrets.GITHUB_TOKEN }}
             action: "upload"
             app_location: "/quotes-admin"
             api_location: ""
             output_location: "build"
   ```

4. Push to GitHub → workflow runs automatically

Via Azure CLI (Manual):

```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy \
  --app-location ./quotes-admin \
  --output-location build \
  --deployment-token YOUR_DEPLOYMENT_TOKEN
```

### Step 3: Verify Static Web App

```bash
# Get Static Web App URL
STATIC_WEB_APP_URL=$(az staticwebapp show \
  --name quotes-admin-dev \
  --resource-group quotes-backend-rg-dev \
  --query defaultHostname -o tsv)

echo "Admin Center URL: https://$STATIC_WEB_APP_URL"
```

Open in browser and test:
1. Login with Azure AD B2C
2. View quotes list
3. Submit new quote
4. Verify admin moderation (if admin role)

---

## Post-Deployment Verification

### Step 1: Smoke Tests

Run automated tests:

```bash
cd quotes-backend/scripts

# Test API endpoints
.\test-api-remote.ps1 -Environment dev

# Expected: 90%+ tests passing
```

### Step 2: Manual Verification Checklist

- [ ] **Health Endpoint**: `https://quotes-func-dev.azurewebsites.net/api/v1/health` returns 200 OK
- [ ] **Public Quotes**: `GET /api/v1/quotes` returns quotes array
- [ ] **Authentication**: Login via Admin Center works with Azure AD B2C
- [ ] **Admin Access**: Admin user can access User Management and Moderation pages
- [ ] **Quote Submission**: Authenticated user can submit new quote
- [ ] **Quote Approval**: Admin can approve/reject pending submissions
- [ ] **CORS**: Admin Center can communicate with Functions API
- [ ] **Monitoring**: Application Insights shows telemetry data
- [ ] **Secrets**: All secrets loaded from Key Vault (check Function App logs)

### Step 3: Monitoring Setup

```bash
# Enable Application Insights
az monitor app-insights component create \
  --app quotes-ai-dev \
  --location eastus \
  --resource-group quotes-backend-rg-dev

# Link to Function App
az functionapp config appsettings set \
  --name quotes-func-dev \
  --resource-group quotes-backend-rg-dev \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="YOUR_INSTRUMENTATION_KEY"
```

View logs:
1. Go to **Application Insights** → **Logs**
2. Query: `requests | where timestamp > ago(1h) | order by timestamp desc`
3. Verify requests are being logged

---

## Environment Management

### Dev Environment

```bash
# Deploy dev
az deployment sub create \
  --name quotes-backend-deployment-dev \
  --location eastus \
  --template-file main.bicep \
  --parameters parameters/dev.bicepparam
```

**Purpose:**
- Local development testing
- Integration testing
- Feature branch testing

**Configuration:**
- Minimal cost (F1 tier for most services)
- Relaxed CORS (allows localhost)
- Mock data seeded
- Detailed logging enabled

### Staging Environment

```bash
# Deploy staging
az deployment sub create \
  --name quotes-backend-deployment-staging \
  --location eastus \
  --template-file main.bicep \
  --parameters parameters/staging.bicepparam
```

**Purpose:**
- Pre-production testing
- Load testing
- UAT (User Acceptance Testing)

**Configuration:**
- Production-like setup
- Same SKUs as production
- Separate B2C tenant
- Separate OAuth apps

### Production Environment

```bash
# Deploy production
az deployment sub create \
  --name quotes-backend-deployment-production \
  --location eastus \
  --template-file main.bicep \
  --parameters parameters/production.bicepparam
```

**Purpose:**
- Live user traffic
- Production data

**Configuration:**
- High availability (3+ instances)
- Premium SKUs
- Strict CORS policy
- Production OAuth apps
- Alerts and monitoring
- Backup and disaster recovery

### Environment Isolation

Each environment has:
- Separate resource group
- Separate Key Vault
- Separate Storage Account
- Separate B2C tenant
- Separate OAuth app registrations
- Separate Application Insights

**No shared resources** to prevent cross-environment contamination.

---

## Troubleshooting

### Deployment Failures

**Issue:** `Code: InvalidTemplateDeployment`

**Solution:** Check Bicep syntax
```bash
az bicep build --file main.bicep
```

**Issue:** `InsufficientPermissions`

**Solution:** Verify Azure RBAC role
```bash
az role assignment list --assignee YOUR_USER_ID --query "[].roleDefinitionName"
# Should include "Owner" or "Contributor"
```

### Function App Issues

**Issue:** Function returns 500 Internal Server Error

**Solution:** Check Function App logs
```bash
az webapp log tail \
  --name quotes-func-dev \
  --resource-group quotes-backend-rg-dev
```

**Issue:** Key Vault secrets not loading

**Solution:** Verify Managed Identity permissions
```bash
az keyvault set-policy \
  --name quotes-kv-dev \
  --object-id $FUNCTION_APP_PRINCIPAL \
  --secret-permissions get list
```

### CORS Issues

**Issue:** CORS error in browser console

**Solution:** Update CorsMiddleware.cs allowed origins
```csharp
private static readonly string[] AllowedOrigins = new[]
{
    "https://quotes-admin-dev.azurestaticapps.net", // Add your domain
    "http://localhost:3000"
};
```

Redeploy Function App after changes.

### Static Web App Issues

**Issue:** 404 on page refresh

**Solution:** Verify `staticwebapp.config.json` exists:
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  }
}
```

**Issue:** Environment variables not loaded

**Solution:** Check Static Web App configuration
```bash
az staticwebapp appsettings set \
  --name quotes-admin-dev \
  --resource-group quotes-backend-rg-dev \
  --setting-names REACT_APP_API_URL=https://quotes-func-dev.azurewebsites.net/api/v1
```

### Azure AD B2C Issues

**Issue:** Login fails with "AADB2C90118" error

**Solution:** Add password reset user flow
1. Go to **User flows** → **New user flow**
2. Select **Password reset**
3. Name: `B2C_1_passwordreset`
4. Link from sign-in page

**Issue:** Token validation fails

**Solution:** Verify JWT issuer in AuthenticationMiddleware.cs
```csharp
ValidIssuer = "https://quotesb2cdev.b2clogin.com/{tenant-id}/v2.0/"
```

### Cost Optimization

**Issue:** Costs exceeding budget

**Solutions:**
- Use F1 (Free tier) for dev environment
- Set Function App to Consumption plan (pay-per-execution)
- Use Static Web App Free tier
- Enable auto-shutdown for dev VMs
- Delete staging resources when not in use
- Set up Azure Cost Management alerts

```bash
# Set cost alert
az consumption budget create \
  --name quotes-monthly-budget \
  --amount 20 \
  --time-grain Monthly \
  --start-date 2025-11-01 \
  --end-date 2026-11-01 \
  --resource-group quotes-backend-rg-dev
```

---

## Support and Documentation

**Additional Resources:**
- [Azure Functions Documentation](https://learn.microsoft.com/azure/azure-functions/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)
- [Azure AD B2C Documentation](https://learn.microsoft.com/azure/active-directory-b2c/)
- [Azure Key Vault Documentation](https://learn.microsoft.com/azure/key-vault/)
- [Bicep Language Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)

**Project Documentation:**
- Backend README: `quotes-backend/README.md`
- Client Integration: `docs/client-integration.md`
- Local Development: `quotes-backend/quickstart.md`
- Testing Guide: `quotes-admin/TESTING.md`

**GitHub Issues:**
- Report bugs: [Project Repository](https://github.com/qpssoft/Quotes/issues)
- Feature requests: Use "enhancement" label

---

## Changelog

### November 2025
- ✅ Initial deployment guide created
- ✅ Dev environment deployment steps
- ✅ Azure AD B2C setup instructions
- ✅ Key Vault configuration
- ✅ Function App deployment
- ✅ Static Web App deployment
- ✅ Post-deployment verification checklist
- ✅ Environment management strategy
- ✅ Troubleshooting section
