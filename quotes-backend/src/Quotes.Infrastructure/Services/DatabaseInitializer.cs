using Microsoft.Extensions.Logging;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Infrastructure.Services;

/// <summary>
/// Initializes the database with default data including root admin user
/// </summary>
public class DatabaseInitializer
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<DatabaseInitializer> _logger;

    // Root admin credentials
    public const string RootAdminEmail = "root@quotes.com";
    public const string RootAdminName = "Root Administrator";
    public const string RootAdminRole = "Admin";

    public DatabaseInitializer(
        IUserRepository userRepository,
        ILogger<DatabaseInitializer> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    /// <summary>
    /// Initializes the database with default users
    /// </summary>
    public async Task InitializeAsync()
    {
        try
        {
            _logger.LogInformation("Starting database initialization...");

            // Check if root admin already exists
            var rootAdmin = await _userRepository.GetByEmailAsync(RootAdminEmail);
            
            if (rootAdmin == null)
            {
                // Create root admin user
                rootAdmin = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = RootAdminEmail,
                    Name = RootAdminName,
                    Provider = "system",
                    Role = RootAdminRole,
                    CreatedAt = DateTime.UtcNow,
                    LastLogin = DateTime.UtcNow,
                    IsActive = true,
                    Claims = new Dictionary<string, string>
                    {
                        { "IsRootAdmin", "true" },
                        { "CanManageUsers", "true" },
                        { "CanManageQuotes", "true" },
                        { "CanAccessAllFeatures", "true" }
                    }
                };

                await _userRepository.AddAsync(rootAdmin);
                _logger.LogInformation("✅ Root admin user created: {Email}", RootAdminEmail);
            }
            else
            {
                _logger.LogInformation("✓ Root admin user already exists: {Email}", RootAdminEmail);
            }

            // Create default test users for development
            await CreateDefaultTestUsersAsync();

            _logger.LogInformation("Database initialization completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during database initialization");
            throw;
        }
    }

    private async Task CreateDefaultTestUsersAsync()
    {
        var testUsers = new[]
        {
            new { Email = "admin@test.com", Name = "Admin User", Role = "Admin" },
            new { Email = "editor@test.com", Name = "Editor User", Role = "Contributor" },
            new { Email = "user@test.com", Name = "Regular User", Role = "Authenticated" }
        };

        foreach (var testUser in testUsers)
        {
            var existingUser = await _userRepository.GetByEmailAsync(testUser.Email);
            if (existingUser == null)
            {
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = testUser.Email,
                    Name = testUser.Name,
                    Provider = "mock",
                    Role = testUser.Role,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                await _userRepository.AddAsync(user);
                _logger.LogInformation("Created test user: {Email} ({Role})", testUser.Email, testUser.Role);
            }
        }
    }
}
