# Simple PowerShell script to upload seed data to Azurite
$ErrorActionPreference = "Stop"

# Install Azure PowerShell module if needed
if (-not (Get-Module -ListAvailable -Name Az.Storage)) {
    Write-Host "Installing Az.Storage module..."
    Install-Module -Name Az.Storage -Force -AllowClobber -Scope CurrentUser
}

Import-Module Az.Storage

# Connection parameters
$storageAccountName = "devstoreaccount1"
$storageAccountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="
$blobEndpoint = "http://127.0.0.1:10000/devstoreaccount1"
$containerName = "quotes"

# Create storage context
$context = New-AzStorageContext -StorageAccountName $storageAccountName `
    -StorageAccountKey $storageAccountKey `
    -BlobEndpoint $blobEndpoint

# Create container
Write-Host "Creating container '$containerName'..."
try {
    New-AzStorageContainer -Name $containerName -Context $context -ErrorAction SilentlyContinue | Out-Null
    Write-Host "Container created or already exists."
} catch {
    Write-Host "Container already exists or error: $_"
}

# Upload files
$seedDataDir = "D:\Projects\Quotes\quotes-backend\seed-data"

Write-Host "Uploading data_vi.json..."
Set-AzStorageBlobContent -File "$seedDataDir\data_vi.json" `
    -Container $containerName `
    -Blob "data_vi.json" `
    -Context $context `
    -Force

Write-Host "Uploading data_en.json..."
Set-AzStorageBlobContent -File "$seedDataDir\data_en.json" `
    -Container $containerName `
    -Blob "data_en.json" `
    -Context $context `
    -Force

Write-Host "Seed data uploaded successfully!"
