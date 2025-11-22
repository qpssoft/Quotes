namespace Quotes.Core.Entities;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    public string Provider { get; set; } = string.Empty; // Google, Facebook, Microsoft
    public string Role { get; set; } = "Authenticated"; // Anonymous, Authenticated, Contributor, Admin
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Token management
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Additional claims
    public Dictionary<string, string> Claims { get; set; } = new();
}
