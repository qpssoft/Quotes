# Upload seed data to Azurite Blob Storage
param(
    [string]$ConnectionString = "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;",
    [string]$ContainerName = "quotes",
    [string]$SeedDataDir = "D:\Projects\Quotes\quotes-backend\seed-data"
)

Write-Host "Creating container '$ContainerName'..."

# Create a simple C# program to upload files
$code = @"
using Azure.Storage.Blobs;
using System;
using System.IO;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var connectionString = args[0];
        var containerName = args[1];
        var seedDataDir = args[2];

        try
        {
            var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            
            // Create container if it doesn't exist
            await containerClient.CreateIfNotExistsAsync();
            Console.WriteLine($"Container '{containerName}' ready.");

            // Upload data_vi.json
            var viFile = Path.Combine(seedDataDir, "data_vi.json");
            if (File.Exists(viFile))
            {
                var viBlob = containerClient.GetBlobClient("data_vi.json");
                await viBlob.UploadAsync(viFile, overwrite: true);
                Console.WriteLine("Uploaded: data_vi.json");
            }

            // Upload data_en.json
            var enFile = Path.Combine(seedDataDir, "data_en.json");
            if (File.Exists(enFile))
            {
                var enBlob = containerClient.GetBlobClient("data_en.json");
                await enBlob.UploadAsync(enFile, overwrite: true);
                Console.WriteLine("Uploaded: data_en.json");
            }

            Console.WriteLine("Seed data upload complete!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            Environment.Exit(1);
        }
    }
}
"@

# Save the C# code to a temp file
$tempDir = Join-Path $env:TEMP "seed-uploader"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
$codeFile = Join-Path $tempDir "Program.cs"
$code | Out-File -FilePath $codeFile -Encoding UTF8

# Create a simple project file
$csproj = @"
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Azure.Storage.Blobs" Version="12.19.1" />
  </ItemGroup>
</Project>
"@

$projFile = Join-Path $tempDir "uploader.csproj"
$csproj | Out-File -FilePath $projFile -Encoding UTF8

Write-Host "Building uploader..."
Push-Location $tempDir
dotnet build -c Release -o bin 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Running uploader..."
    dotnet run --no-build -c Release -- $ConnectionString $ContainerName $SeedDataDir
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
