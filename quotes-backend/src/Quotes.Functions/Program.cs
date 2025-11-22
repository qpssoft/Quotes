using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Azure.Storage.Blobs;
using Quotes.Core.Interfaces;
using Quotes.Infrastructure.Repositories;
using Quotes.Infrastructure.Services;
using Quotes.Application.UseCases;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        // Memory Cache
        services.AddMemoryCache();
        services.AddSingleton<MemoryCacheService>();

        // Azure Storage
        var storageConnectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage") 
            ?? throw new InvalidOperationException("AzureWebJobsStorage not configured");
        services.AddSingleton(new BlobServiceClient(storageConnectionString));

        // Repositories
        services.AddScoped<IQuoteRepository, BlobQuoteRepository>();
        services.AddScoped<IUserRepository, BlobUserRepository>();

        // Services
        var sendGridApiKey = Environment.GetEnvironmentVariable("SendGridApiKey") ?? "";
        services.AddScoped<IEmailService>(sp => new SendGridEmailService(sendGridApiKey));

        // Key Vault (optional for local development)
        var keyVaultUri = Environment.GetEnvironmentVariable("KeyVaultUri");
        if (!string.IsNullOrEmpty(keyVaultUri))
        {
            services.AddSingleton(new KeyVaultConfigurationProvider(keyVaultUri));
        }

        // Application Insights
        services.AddApplicationInsightsTelemetryWorkerService();
        services.AddSingleton<ApplicationInsightsTelemetry>();

        // Use Cases
        services.AddScoped<GetAllQuotesUseCase>();
        services.AddScoped<GetQuoteByIdUseCase>();
        services.AddScoped<SubmitUserQuoteUseCase>();
        services.AddScoped<ApproveQuoteUseCase>();
        services.AddScoped<RejectQuoteUseCase>();
        services.AddScoped<ManageUserUseCase>();
    })
    .Build();

host.Run();
