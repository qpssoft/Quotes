# Azure Deployment Quick Start Guide

This guide will help you deploy the Quotes Backend to Azure in **under 15 minutes**.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Azure CLI** installed ([Download](https://aka.ms/installazurecliwindows))
- ✅ **Azure Subscription** with Owner or Contributor access
- ✅ **.NET SDK 8.0+** installed ([Download](https://dotnet.microsoft.com/download))
- ✅ **Azure Functions Core Tools** installed (`npm install -g azure-functions-core-tools@4 --unsafe-perm true`)

## 🚀 Quick Deployment (3 Commands)

### Step 1: Login to Azure

```powershell
az login
```

This opens a browser window for authentication. After logging in, select your subscription:

```powershell
# List subscriptions
az account list --output table

# Set active subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 2: Deploy Infrastructure & Function App

```powershell
cd infrastructure
.\deploy.ps1 -Environment dev
```

This single command will:
- ✅ Validate Azure CLI and tools
- ✅ Deploy all Azure resources (Storage, Key Vault, Function App, etc.)
- ✅ Configure Key Vault secrets
- ✅ Build and deploy the Function App
- ✅ Run health checks

**Time:** 10-12 minutes

### Step 3: Test Your Deployment

```powershell
# The deploy script shows your Function App URL
# Test it with:
curl https://quotes-func-dev.azurewebsites.net/api/v1/health
curl https://quotes-func-dev.azurewebsites.net/api/v1/quotes
```

**That's it! Your backend is live! 🎉**

---

## 📦 What Gets Deployed

The deployment creates these Azure resources:

| Resource | Purpose | Cost (Dev) |
|----------|---------|------------|
| **Resource Group** | Container for all resources | Free |
| **Storage Account** | Stores quotes, users, blobs | ~$1/month |
| **Key Vault** | Securely stores secrets | ~$0.03/month |
| **Function App** | Hosts the API (Consumption plan) | ~$0-5/month |
| **Application Insights** | Monitoring and logging | ~$2/month |
| **App Configuration** | Feature flags and settings | Free tier |

**Total Estimated Cost:** $3-8/month for dev environment

---

## 🎛️ Deployment Options

### Deploy to Different Environments

```powershell
# Dev environment (default)
.\deploy.ps1 -Environment dev

# Staging environment
.\deploy.ps1 -Environment staging

# Production environment
.\deploy.ps1 -Environment production
```

### Deploy to Different Regions

```powershell
# East US (default)
.\deploy.ps1 -Environment dev -Location eastus

# West Europe
.\deploy.ps1 -Environment dev -Location westeurope

# Southeast Asia
.\deploy.ps1 -Environment dev -Location southeastasia
```

### Partial Deployments

```powershell
# Only deploy infrastructure (skip Function App)
.\deploy.ps1 -Environment dev -SkipFunctionDeploy

# Only deploy Function App (skip infrastructure)
.\deploy.ps1 -Environment dev -SkipInfrastructure

# Dry run (see what would be deployed)
.\deploy.ps1 -Environment dev -WhatIf
```

---

## 🔑 Key Vault Configuration

The deployment script automatically creates these secrets:

- ✅ **StorageConnectionString** - Storage account connection
- ✅ **JwtSecret** - For token signing

### Add Additional Secrets Manually

After deployment, you may want to add OAuth provider secrets:

```powershell
# Get Key Vault name from deployment outputs
$keyVaultName = "quotes-kv-dev"

# Azure AD B2C
az keyvault secret set --vault-name $keyVaultName --name AzureAdB2C--TenantId --value "your-tenant.onmicrosoft.com"
az keyvault secret set --vault-name $keyVaultName --name AzureAdB2C--ClientId --value "your-client-id"

# Google OAuth
az keyvault secret set --vault-name $keyVaultName --name Google--ClientId --value "your-google-client-id"
az keyvault secret set --vault-name $keyVaultName --name Google--ClientSecret --value "your-google-client-secret"
```

See [docs/deployment.md](docs/deployment.md) for detailed OAuth setup instructions.

---

## 📊 Monitoring Your Deployment

### View Function App Logs

```powershell
az webapp log tail --name quotes-func-dev --resource-group quotes-backend-rg-dev
```

### Open in Azure Portal

```powershell
# Open Function App in browser
az functionapp show --name quotes-func-dev --resource-group quotes-backend-rg-dev --query id -o tsv | % { start "https://portal.azure.com/#resource/$_" }

# Open Resource Group in browser
start "https://portal.azure.com/#resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/quotes-backend-rg-dev"
```

### Check Application Insights

```powershell
# View recent requests
az monitor app-insights query --app quotes-insights-dev --analytics-query "requests | where timestamp > ago(1h) | order by timestamp desc | take 20"
```

---

## 🧪 Testing Your Deployment

### Run Automated API Tests

```powershell
cd quotes-backend
.\scripts\test-api-remote.ps1 -BaseUrl "https://quotes-func-dev.azurewebsites.net"
```

### Manual Testing

```powershell
# Health check
curl https://quotes-func-dev.azurewebsites.net/api/v1/health

# Get all quotes
curl https://quotes-func-dev.azurewebsites.net/api/v1/quotes

# Get quotes in Vietnamese
curl "https://quotes-func-dev.azurewebsites.net/api/v1/quotes?language=vi"

# Get single quote
curl https://quotes-func-dev.azurewebsites.net/api/v1/quotes/1
```

---

## 🔧 Troubleshooting

### Deployment Fails with "InsufficientPermissions"

**Solution:** Verify you have Contributor or Owner role on the subscription:

```powershell
az role assignment list --assignee $(az account show --query user.name -o tsv) --query "[].roleDefinitionName"
```

### Function App Returns 500 Error

**Solution:** Check Function App logs:

```powershell
az webapp log tail --name quotes-func-dev --resource-group quotes-backend-rg-dev
```

### Key Vault Access Denied

**Solution:** Grant your user account access:

```powershell
$keyVaultName = "quotes-kv-dev"
$userId = az ad signed-in-user show --query id -o tsv

az keyvault set-policy --name $keyVaultName --object-id $userId --secret-permissions get list set delete
```

### Bicep Validation Errors

**Solution:** Check Bicep syntax:

```powershell
cd infrastructure
az bicep build --file main.bicep
```

### Function App Not Responding

**Solution:** Function Apps can take 30-60 seconds to warm up after deployment. Wait a bit and try again.

If still not working, restart the Function App:

```powershell
az functionapp restart --name quotes-func-dev --resource-group quotes-backend-rg-dev
```

---

## 🗑️ Cleanup (Delete All Resources)

To delete all Azure resources and stop incurring costs:

```powershell
# Delete entire resource group (⚠️ irreversible!)
az group delete --name quotes-backend-rg-dev --yes --no-wait

# Verify deletion
az group show --name quotes-backend-rg-dev
# Should show: ResourceGroupNotFound
```

---

## 📚 Next Steps

After deploying the backend:

1. **Deploy Admin Portal**
   - Navigate to `quotes-admin`
   - Follow [quotes-admin/README.md](quotes-admin/README.md) for Static Web App deployment

2. **Configure Authentication**
   - Set up Azure AD B2C tenant
   - Configure OAuth providers (Google, Facebook)
   - See [docs/deployment.md](docs/deployment.md) for details

3. **Seed Initial Data**
   - Run seed scripts to populate quotes
   - See [quotes-backend/scripts/README.md](quotes-backend/scripts/README.md)

4. **Set Up CI/CD**
   - Configure GitHub Actions for automatic deployments
   - See [.github/workflows/README.md](.github/workflows/README.md)

---

## 📖 Additional Documentation

- **Detailed Deployment Guide:** [docs/deployment.md](docs/deployment.md)
- **Backend Documentation:** [quotes-backend/README.md](quotes-backend/README.md)
- **API Documentation:** [docs/client-integration.md](docs/client-integration.md)
- **Local Development:** [quotes-backend/QUICK_START.md](quotes-backend/QUICK_START.md)

---

## 💬 Support

**Questions or Issues?**

- Check [docs/deployment.md](docs/deployment.md) for detailed troubleshooting
- Review Function App logs: `az webapp log tail --name quotes-func-dev --resource-group quotes-backend-rg-dev`
- Open an issue: [GitHub Issues](https://github.com/qpssoft/Quotes/issues)

---

## 🎉 Deployment Checklist

After running `.\deploy.ps1`, verify:

- [ ] Infrastructure deployed successfully
- [ ] Function App running
- [ ] Health endpoint responds: `/api/v1/health`
- [ ] Quotes endpoint responds: `/api/v1/quotes`
- [ ] Key Vault contains required secrets
- [ ] Application Insights receiving telemetry
- [ ] Function App logs show no errors

**If all checks pass, your Quotes Backend is live on Azure! 🚀**
