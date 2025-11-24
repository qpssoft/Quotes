using Quotes.Core.Entities;
using Xunit;

namespace Quotes.Core.Tests.Entities;

public class UserTests
{
    [Fact]
    public void User_DefaultValues_AreSetCorrectly()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        Assert.NotEqual(Guid.Empty.ToString(), user.Id);
        Assert.Equal(string.Empty, user.Email);
        Assert.Equal(string.Empty, user.Name);
        Assert.Null(user.ProfilePicture);
        Assert.Equal(string.Empty, user.Provider);
        Assert.Equal("Authenticated", user.Role);
        Assert.True(user.IsActive);
        Assert.Null(user.LastLogin);
        Assert.Null(user.RefreshToken);
        Assert.Null(user.RefreshTokenExpiry);
        Assert.NotNull(user.Claims);
        Assert.Empty(user.Claims);
    }

    [Fact]
    public void User_Id_IsGeneratedAutomatically()
    {
        // Arrange & Act
        var user1 = new User();
        var user2 = new User();

        // Assert
        Assert.NotEqual(user1.Id, user2.Id);
        Assert.True(Guid.TryParse(user1.Id, out _));
        Assert.True(Guid.TryParse(user2.Id, out _));
    }

    [Fact]
    public void User_CreatedAt_IsSetToUtcNow()
    {
        // Arrange
        var before = DateTime.UtcNow.AddSeconds(-1);
        
        // Act
        var user = new User();
        var after = DateTime.UtcNow.AddSeconds(1);

        // Assert
        Assert.True(user.CreatedAt >= before && user.CreatedAt <= after);
        Assert.Equal(DateTimeKind.Utc, user.CreatedAt.Kind);
    }

    [Theory]
    [InlineData("Anonymous")]
    [InlineData("Authenticated")]
    [InlineData("Contributor")]
    [InlineData("Admin")]
    public void User_Role_CanBeSet(string role)
    {
        // Arrange & Act
        var user = new User { Role = role };

        // Assert
        Assert.Equal(role, user.Role);
    }

    [Theory]
    [InlineData("Google")]
    [InlineData("Facebook")]
    [InlineData("Microsoft")]
    [InlineData("email")]
    public void User_Provider_CanBeSet(string provider)
    {
        // Arrange & Act
        var user = new User { Provider = provider };

        // Assert
        Assert.Equal(provider, user.Provider);
    }

    [Fact]
    public void User_Email_CanBeSet()
    {
        // Arrange
        var email = "test@example.com";
        
        // Act
        var user = new User { Email = email };

        // Assert
        Assert.Equal(email, user.Email);
    }

    [Fact]
    public void User_Name_CanBeSet()
    {
        // Arrange
        var name = "Test User";
        
        // Act
        var user = new User { Name = name };

        // Assert
        Assert.Equal(name, user.Name);
    }

    [Fact]
    public void User_ProfilePicture_CanBeSet()
    {
        // Arrange
        var url = "https://example.com/avatar.jpg";
        
        // Act
        var user = new User { ProfilePicture = url };

        // Assert
        Assert.Equal(url, user.ProfilePicture);
    }

    [Fact]
    public void User_IsActive_DefaultsToTrue()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        Assert.True(user.IsActive);
    }

    [Fact]
    public void User_IsActive_CanBeSetToFalse()
    {
        // Arrange & Act
        var user = new User { IsActive = false };

        // Assert
        Assert.False(user.IsActive);
    }

    [Fact]
    public void User_LastLogin_CanBeSet()
    {
        // Arrange
        var loginTime = DateTime.UtcNow;
        
        // Act
        var user = new User { LastLogin = loginTime };

        // Assert
        Assert.Equal(loginTime, user.LastLogin);
    }

    [Fact]
    public void User_RefreshToken_CanBeSet()
    {
        // Arrange
        var token = "refresh-token-123";
        
        // Act
        var user = new User { RefreshToken = token };

        // Assert
        Assert.Equal(token, user.RefreshToken);
    }

    [Fact]
    public void User_RefreshTokenExpiry_CanBeSet()
    {
        // Arrange
        var expiry = DateTime.UtcNow.AddDays(7);
        
        // Act
        var user = new User { RefreshTokenExpiry = expiry };

        // Assert
        Assert.Equal(expiry, user.RefreshTokenExpiry);
    }

    [Fact]
    public void User_Claims_CanBeModified()
    {
        // Arrange
        var user = new User();

        // Act
        user.Claims.Add("department", "Engineering");
        user.Claims.Add("location", "Hanoi");

        // Assert
        Assert.Equal(2, user.Claims.Count);
        Assert.Equal("Engineering", user.Claims["department"]);
        Assert.Equal("Hanoi", user.Claims["location"]);
    }

    [Fact]
    public void User_FullUserCreation_SetsAllProperties()
    {
        // Arrange & Act
        var user = new User
        {
            Email = "admin@example.com",
            Name = "Admin User",
            ProfilePicture = "https://example.com/avatar.jpg",
            Provider = "Google",
            Role = "Admin",
            LastLogin = DateTime.UtcNow,
            IsActive = true,
            RefreshToken = "token-123",
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
        };
        user.Claims.Add("department", "IT");

        // Assert
        Assert.Equal("admin@example.com", user.Email);
        Assert.Equal("Admin User", user.Name);
        Assert.Equal("https://example.com/avatar.jpg", user.ProfilePicture);
        Assert.Equal("Google", user.Provider);
        Assert.Equal("Admin", user.Role);
        Assert.NotNull(user.LastLogin);
        Assert.True(user.IsActive);
        Assert.Equal("token-123", user.RefreshToken);
        Assert.NotNull(user.RefreshTokenExpiry);
        Assert.Single(user.Claims);
        Assert.Equal("IT", user.Claims["department"]);
    }

    [Fact]
    public void User_DefaultRole_IsAuthenticated()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        Assert.Equal("Authenticated", user.Role);
    }

    [Fact]
    public void User_Id_CanBeOverwritten()
    {
        // Arrange
        var customId = "custom-id-123";
        
        // Act
        var user = new User { Id = customId };

        // Assert
        Assert.Equal(customId, user.Id);
    }
}
