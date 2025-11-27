targetScope = 'subscription'

@description('Environment name (dev, staging, production)')
@allowed(['dev', 'staging', 'production'])
param environment string = 'dev'

@description('Azure region for all resources')
param location string = 'eastus'

@description('Resource Group name')
param resourceGroupName string = 'quotes-backend-rg-${environment}'

// Resource Group
module rg './modules/resourceGroup.bicep' = {
  name: 'resourceGroup'
  params: {
    name: resourceGroupName
    location: location
  }
}

// Storage Account
module storage './modules/storageAccount.bicep' = {
  name: 'storageAccount'
  scope: resourceGroup(resourceGroupName)
  params: {
    name: 'quotesstorage${environment}'
    location: location
    environment: environment
  }
  dependsOn: [rg]
}

// Key Vault
module keyVault './modules/keyVault.bicep' = {
  name: 'keyVault'
  scope: resourceGroup(resourceGroupName)
  params: {
    name: 'quotes-kv-${environment}'
    location: location
    environment: environment
  }
  dependsOn: [rg]
}

// App Configuration
module appConfig './modules/appConfiguration.bicep' = {
  name: 'appConfiguration'
  scope: resourceGroup(resourceGroupName)
  params: {
    name: 'quotes-appconfig-${environment}'
    location: location
    environment: environment
  }
  dependsOn: [rg]
}

// Application Insights
module appInsights './modules/applicationInsights.bicep' = {
  name: 'applicationInsights'
  scope: resourceGroup(resourceGroupName)
  params: {
    name: 'quotes-insights-${environment}'
    location: location
    environment: environment
  }
  dependsOn: [rg]
}

// Function App
module functionApp './modules/functionApp.bicep' = {
  name: 'functionApp'
  scope: resourceGroup(resourceGroupName)
  params: {
    name: 'quotes-func-${environment}'
    location: location
    environment: environment
    storageAccountName: storage.outputs.storageAccountName
    keyVaultName: keyVault.outputs.keyVaultName
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
  }
  dependsOn: [storage, keyVault, appInsights]
}

// Static Web App - Temporarily disabled (not available in all regions)
// TODO: Deploy separately to a supported region (westus2, centralus, eastus2, westeurope, eastasia)
// module staticWebApp './modules/staticWebApp.bicep' = {
//   name: 'staticWebApp'
//   scope: resourceGroup(resourceGroupName)
//   params: {
//     name: 'quotes-admin-${environment}'
//     location: location
//     environment: environment
//   }
//   dependsOn: [rg]
// }

output resourceGroupName string = resourceGroupName
output storageAccountName string = storage.outputs.storageAccountName
output functionAppName string = functionApp.outputs.functionAppName
// output staticWebAppName string = staticWebApp.outputs.staticWebAppName
output keyVaultName string = keyVault.outputs.keyVaultName
