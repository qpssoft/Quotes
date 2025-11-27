# Azure Deployment Checklist

Use this checklist to track your deployment progress.

## ✅ Pre-Deployment (5 minutes)

### Tools Installation
- [ ] Azure CLI installed (`az --version` shows 2.45+)
- [ ] .NET SDK 8.0 installed (`dotnet --version` shows 8.x)
- [ ] Azure Functions Core Tools v4 installed (`func --version` shows 4.x)
- [ ] PowerShell 5.1+ or PowerShell Core 7+

### Azure Account Setup
- [ ] Azure subscription active
- [ ] Logged in to Azure CLI (`az login`)
- [ ] Correct subscription selected (`az account show`)
- [ ] Have Owner or Contributor role on subscription

### Repository Setup
- [ ] Cloned repository locally
- [ ] Navigated to project root: `cd D:\Projects\Quotes`
- [ ] Backend builds successfully: `cd quotes-backend; dotnet build`

---

## 🚀 Deployment (10-12 minutes)

### Run Deployment Script
```powershell
cd infrastructure
.\deploy.ps1 -Environment dev
```

### What Happens (Automated)
- [ ] ✓ Prerequisites validated
- [ ] ✓ Bicep template validated
- [ ] ✓ Resource Group created
- [ ] ✓ Storage Account created
- [ ] ✓ Key Vault created
- [ ] ✓ Function App created
- [ ] ✓ Application Insights created
- [ ] ✓ App Configuration created
- [ ] ✓ Key Vault secrets configured
- [ ] ✓ Function App built
- [ ] ✓ Function App deployed
- [ ] ✓ Health check passed

### Record Deployment Outputs
After successful deployment, save these values:

**Resource Group:** `_______________________________`

**Function App Name:** `_______________________________`

**Function App URL:** `_______________________________`

**Key Vault Name:** `_______________________________`

**Storage Account:** `_______________________________`

---

## 🧪 Post-Deployment Verification (2 minutes)

### API Endpoints Testing

```powershell
# Replace with your Function App URL
$url = "https://quotes-func-dev.azurewebsites.net"

# Test health endpoint
curl "$url/api/v1/health"
```
- [ ] Health endpoint returns `{"status":"healthy"}`

```powershell
# Test quotes endpoint
curl "$url/api/v1/quotes"
```
- [ ] Quotes endpoint returns JSON array (may be empty initially)

### Azure Portal Verification

Open Function App in Azure Portal:
```powershell
az functionapp show --name quotes-func-dev --resource-group quotes-backend-rg-dev --query id -o tsv | % { start "https://portal.azure.com/#resource/$_" }
```

- [ ] Function App is running (green checkmark)
- [ ] Functions are listed (AuthFunction, QuotesFunction, etc.)
- [ ] No errors in "Monitor" → "Logs"
- [ ] Application Insights connected and receiving data

### Key Vault Verification

```powershell
az keyvault secret list --vault-name quotes-kv-dev --query "[].name" -o table
```

- [ ] `StorageConnectionString` secret exists
- [ ] `JwtSecret` secret exists

---

## 🔐 Optional: Configure Authentication (15 minutes)

### Azure AD B2C Setup (if needed)

See detailed guide: [docs/deployment.md](docs/deployment.md#azure-ad-b2c-setup)

- [ ] Azure AD B2C tenant created
- [ ] App registration created
- [ ] User flow created (B2C_1_signupsignin)
- [ ] Redirect URIs configured
- [ ] OAuth providers configured (Google, Facebook)

### Add OAuth Secrets to Key Vault

```powershell
$keyVaultName = "quotes-kv-dev"

# Azure AD B2C
az keyvault secret set --vault-name $keyVaultName --name AzureAdB2C--TenantId --value "your-tenant.onmicrosoft.com"
az keyvault secret set --vault-name $keyVaultName --name AzureAdB2C--ClientId --value "your-client-id"

# Google OAuth (optional)
az keyvault secret set --vault-name $keyVaultName --name Google--ClientId --value "your-google-client-id"
az keyvault secret set --vault-name $keyVaultName --name Google--ClientSecret --value "your-google-secret"
```

- [ ] B2C secrets added to Key Vault
- [ ] OAuth secrets added to Key Vault

### Restart Function App

```powershell
az functionapp restart --name quotes-func-dev --resource-group quotes-backend-rg-dev
```

- [ ] Function App restarted to load new secrets

---

## 📱 Deploy Admin Portal (Optional, 10 minutes)

If you want to deploy the Admin Center web app:

### Update Admin Configuration

Edit `quotes-admin/.env.production`:
```env
REACT_APP_API_URL=https://quotes-func-dev.azurewebsites.net/api/v1
REACT_APP_MOCK_AUTH=false
REACT_APP_B2C_TENANT_NAME=your-tenant-name
REACT_APP_B2C_CLIENT_ID=your-client-id
REACT_APP_B2C_POLICY_NAME=B2C_1_signupsignin
```

- [ ] Environment variables configured

### Deploy to Static Web App

```powershell
cd quotes-admin

# Build
npm install
npm run build

# Get deployment token
$token = az staticwebapp secrets list --name quotes-admin-dev --resource-group quotes-backend-rg-dev --query properties.apiKey -o tsv

# Deploy
npm install -g @azure/static-web-apps-cli
swa deploy --app-location . --output-location build --deployment-token $token
```

- [ ] Admin portal built successfully
- [ ] Admin portal deployed to Static Web App
- [ ] Admin portal accessible at URL
- [ ] Login flow works with Azure AD B2C

---

## 🎯 Next Steps

### Seed Sample Data

```powershell
cd quotes-backend\scripts
.\seed-data.ps1 -Environment dev
```

- [ ] Sample quotes loaded into storage

### Run Full Test Suite

```powershell
cd quotes-backend
.\scripts\test-api-remote.ps1 -BaseUrl "https://quotes-func-dev.azurewebsites.net"
```

- [ ] All API tests passing (90%+ success rate)

### Set Up Monitoring

- [ ] Application Insights dashboard configured
- [ ] Alerts configured for errors and performance
- [ ] Log Analytics workspace connected

### Configure CI/CD (Optional)

See: [.github/workflows/README.md](.github/workflows/README.md)

- [ ] GitHub Actions workflow configured
- [ ] Automatic deployment on push to main
- [ ] Branch protection rules configured

---

## 📊 Estimated Costs

### Dev Environment (Consumption Plan)

| Service | Estimated Cost/Month |
|---------|---------------------|
| Function App (Consumption) | $0-5 |
| Storage Account (Standard) | $1-2 |
| Key Vault | $0.03 |
| Application Insights | $2-3 |
| App Configuration (Free tier) | $0 |
| Static Web App (Free tier) | $0 |
| **Total** | **$3-10/month** |

### Production Environment (Scaling Up)

| Service | Estimated Cost/Month |
|---------|---------------------|
| Function App (Premium) | $15-30 |
| Storage Account (Standard) | $5-10 |
| Key Vault | $0.50 |
| Application Insights | $10-20 |
| App Configuration (Standard) | $1.20 |
| Static Web App (Standard) | $9 |
| Azure AD B2C (50k MAU) | Free |
| **Total** | **$40-70/month** |

*Prices may vary by region and usage patterns*

---

## 🔥 Troubleshooting Common Issues

### Issue: "az: command not found"
**Solution:** Install Azure CLI from https://aka.ms/installazurecliwindows

### Issue: "Deployment failed with InsufficientPermissions"
**Solution:** Ensure you have Contributor role:
```powershell
az role assignment list --assignee $(az account show --query user.name -o tsv)
```

### Issue: Function App returns 500 errors
**Solution:** Check logs for errors:
```powershell
az webapp log tail --name quotes-func-dev --resource-group quotes-backend-rg-dev
```

### Issue: Key Vault secrets not loading
**Solution:** Verify Managed Identity has access:
```powershell
$principalId = az functionapp identity show --name quotes-func-dev --resource-group quotes-backend-rg-dev --query principalId -o tsv
az keyvault set-policy --name quotes-kv-dev --object-id $principalId --secret-permissions get list
```

### Issue: CORS errors from Admin Portal
**Solution:** Add Static Web App URL to Function App CORS settings:
```powershell
az functionapp cors add --name quotes-func-dev --resource-group quotes-backend-rg-dev --allowed-origins "https://your-static-web-app.azurestaticapps.net"
```

---

## ✅ Deployment Complete!

### Summary

- ✅ Azure infrastructure deployed
- ✅ Backend API running on Azure Functions
- ✅ Secrets stored securely in Key Vault
- ✅ Monitoring enabled with Application Insights
- ✅ API endpoints tested and working

### Your Resources

**API Base URL:** `https://quotes-func-dev.azurewebsites.net/api/v1`

**Admin Portal:** `https://quotes-admin-dev.azurestaticapps.net` (if deployed)

**Azure Portal:** https://portal.azure.com

### Useful Commands

```powershell
# View logs
az webapp log tail --name quotes-func-dev --resource-group quotes-backend-rg-dev

# Restart Function App
az functionapp restart --name quotes-func-dev --resource-group quotes-backend-rg-dev

# List all resources
az resource list --resource-group quotes-backend-rg-dev --output table

# Delete everything (cleanup)
az group delete --name quotes-backend-rg-dev --yes --no-wait
```

---

## 📚 Documentation Links

- **Detailed Deployment Guide:** [docs/deployment.md](docs/deployment.md)
- **Quick Start (Azure):** [AZURE_DEPLOYMENT_QUICKSTART.md](AZURE_DEPLOYMENT_QUICKSTART.md)
- **Backend README:** [quotes-backend/README.md](quotes-backend/README.md)
- **API Documentation:** [docs/client-integration.md](docs/client-integration.md)
- **Local Development:** [quotes-backend/QUICK_START.md](quotes-backend/QUICK_START.md)

---

**🎉 Congratulations! Your Quotes Backend is now running in Azure! 🎉**
