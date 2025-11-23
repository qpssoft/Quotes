using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Quotes.Infrastructure.Services;

/// <summary>
/// Background service that initializes the database on application startup
/// </summary>
public class DatabaseInitializerHostedService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseInitializerHostedService> _logger;

    public DatabaseInitializerHostedService(
        IServiceProvider serviceProvider,
        ILogger<DatabaseInitializerHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("DatabaseInitializerHostedService starting...");

        try
        {
            // Create a scope to resolve scoped services
            using var scope = _serviceProvider.CreateScope();
            var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
            
            await initializer.InitializeAsync();
            
            _logger.LogInformation("DatabaseInitializerHostedService completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in DatabaseInitializerHostedService");
            // Don't throw - allow the application to start even if initialization fails
        }

        return;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("DatabaseInitializerHostedService stopping...");
        return Task.CompletedTask;
    }
}
