using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Azure.Storage.Blobs;
using Quotes.Core.Interfaces;
using Quotes.Infrastructure.Repositories;
using Quotes.Infrastructure.Services;
using Quotes.Infrastructure.Auth;
using Quotes.Application.UseCases;
using Quotes.Functions.Middleware;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults(builder =>
    {
        // Add CORS middleware first
        builder.UseMiddleware<CorsMiddleware>();
        // Add authentication middleware
        builder.UseMiddleware<AuthenticationMiddleware>();
        // Then rate limiting middleware
        builder.UseMiddleware<RateLimitingMiddleware>();
    })
    .ConfigureServices((context, services) =>
    {
        // Memory Cache
        services.AddMemoryCache();
        services.AddSingleton<MemoryCacheService>();

        // Azure Storage
        var storageConnectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage") 
            ?? throw new InvalidOperationException("AzureWebJobsStorage not configured");
        services.AddSingleton(new BlobServiceClient(storageConnectionString));

        // JWT Authentication
        var jwtSettings = new JwtSettings
        {
            SecretKey = Environment.GetEnvironmentVariable("JwtSecretKey") ?? "your-256-bit-secret-key-here-change-in-production-min-32-chars",
            Issuer = Environment.GetEnvironmentVariable("JwtIssuer") ?? "https://quotes-api.azurewebsites.net",
            Audience = Environment.GetEnvironmentVariable("JwtAudience") ?? "quotes-api-clients",
            ExpirationMinutes = int.TryParse(Environment.GetEnvironmentVariable("JwtExpirationMinutes"), out var exp) ? exp : 60,
            RefreshTokenExpirationDays = 7
        };
        services.AddSingleton(jwtSettings);
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        // Repositories
        services.AddScoped<IQuoteRepository, BlobQuoteRepository>();
        services.AddScoped<IUserRepository, BlobUserRepository>();

        // Database Initialization (registered but not auto-run)
        services.AddScoped<DatabaseInitializer>();

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
        services.AddScoped<CreateQuoteUseCase>();
        services.AddScoped<UpdateQuoteUseCase>();
        services.AddScoped<DeleteQuoteUseCase>();
        services.AddScoped<GetUserQuotesUseCase>();
        services.AddScoped<SubmitUserQuoteUseCase>();
        services.AddScoped<ApproveQuoteUseCase>();
        services.AddScoped<RejectQuoteUseCase>();
        services.AddScoped<ManageUserUseCase>();
        services.AddScoped<GetAllUsersUseCase>();
        services.AddScoped<GetUserByIdUseCase>();
        services.AddScoped<UpdateUserUseCase>();
        services.AddScoped<DeleteUserUseCase>();
        services.AddScoped<BanUserUseCase>();
    })
    .Build();

host.Run();

