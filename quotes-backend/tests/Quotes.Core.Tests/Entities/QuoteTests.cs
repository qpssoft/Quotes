using Quotes.Core.Entities;
using Xunit;

namespace Quotes.Core.Tests.Entities;

public class QuoteTests
{
    [Fact]
    public void Quote_DefaultValues_AreSetCorrectly()
    {
        // Arrange & Act
        var quote = new Quote();

        // Assert
        Assert.Equal(string.Empty, quote.Id);
        Assert.Equal(string.Empty, quote.Content);
        Assert.Equal(string.Empty, quote.Author);
        Assert.Equal(string.Empty, quote.Category);
        Assert.NotNull(quote.Tags);
        Assert.Empty(quote.Tags);
        Assert.Equal("vi", quote.Language);
        Assert.Equal("quote", quote.Type);
        Assert.True(quote.IsPublic);
        Assert.Null(quote.CreatedBy);
    }

    [Fact]
    public void IsValid_WithValidQuote_ReturnsTrue()
    {
        // Arrange
        var quote = new Quote
        {
            Content = "Valid quote content",
            Author = "Test Author",
            Language = "vi"
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.True(result);
        Assert.Empty(errors);
    }

    [Fact]
    public void IsValid_WithEmptyContent_ReturnsFalse()
    {
        // Arrange
        var quote = new Quote
        {
            Content = "",
            Author = "Test Author",
            Language = "vi"
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.False(result);
        Assert.Contains("Content is required", errors);
    }

    [Fact]
    public void IsValid_WithWhitespaceContent_ReturnsFalse()
    {
        // Arrange
        var quote = new Quote
        {
            Content = "   ",
            Author = "Test Author",
            Language = "vi"
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.False(result);
        Assert.Contains("Content is required", errors);
    }

    [Fact]
    public void IsValid_WithContentExceedingMaxLength_ReturnsFalse()
    {
        // Arrange
        var quote = new Quote
        {
            Content = new string('a', Quote.MaxContentLength + 1),
            Author = "Test Author",
            Language = "vi"
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.False(result);
        Assert.Contains($"Content must not exceed {Quote.MaxContentLength} characters", errors);
    }

    [Fact]
    public void IsValid_WithEmptyAuthor_ReturnsFalse()
    {
        // Arrange
        var quote = new Quote
        {
            Content = "Valid content",
            Author = "",
            Language = "vi"
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.False(result);
        Assert.Contains("Author is required", errors);
    }

    [Fact]
    public void IsValid_WithAuthorExceedingMaxLength_ReturnsFalse()
    {
        // Arrange
        var quote = new Quote
        {
            Content = "Valid content",
            Author = new string('a', Quote.MaxAuthorLength + 1),
            Language = "vi"
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.False(result);
        Assert.Contains($"Author must not exceed {Quote.MaxAuthorLength} characters", errors);
    }

    [Fact]
    public void IsValid_WithEmptyLanguage_ReturnsFalse()
    {
        // Arrange
        var quote = new Quote
        {
            Content = "Valid content",
            Author = "Test Author",
            Language = ""
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.False(result);
        Assert.Contains("Language is required", errors);
    }

    [Theory]
    [InlineData("vi")]
    [InlineData("en")]
    [InlineData("VI")]
    [InlineData("EN")]
    public void IsValid_WithValidLanguage_ReturnsTrue(string language)
    {
        // Arrange
        var quote = new Quote
        {
            Content = "Valid content",
            Author = "Test Author",
            Language = language
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.True(result);
        Assert.Empty(errors);
    }

    [Theory]
    [InlineData("fr")]
    [InlineData("es")]
    [InlineData("de")]
    [InlineData("invalid")]
    public void IsValid_WithInvalidLanguage_ReturnsFalse(string language)
    {
        // Arrange
        var quote = new Quote
        {
            Content = "Valid content",
            Author = "Test Author",
            Language = language
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.False(result);
        Assert.Contains("Language must be 'vi' or 'en'", errors);
    }

    [Fact]
    public void IsValid_WithMultipleErrors_ReturnsAllErrors()
    {
        // Arrange
        var quote = new Quote
        {
            Content = "",
            Author = "",
            Language = "fr"
        };

        // Act
        var result = quote.IsValid(out var errors);

        // Assert
        Assert.False(result);
        Assert.Equal(3, errors.Count);
        Assert.Contains("Content is required", errors);
        Assert.Contains("Author is required", errors);
        Assert.Contains("Language must be 'vi' or 'en'", errors);
    }

    [Fact]
    public void Quote_MaxLengthConstants_AreCorrect()
    {
        // Assert
        Assert.Equal(500, Quote.MaxContentLength);
        Assert.Equal(100, Quote.MaxAuthorLength);
    }

    [Fact]
    public void Quote_TagsCollection_CanBeModified()
    {
        // Arrange
        var quote = new Quote();

        // Act
        quote.Tags.Add("wisdom");
        quote.Tags.Add("motivation");

        // Assert
        Assert.Equal(2, quote.Tags.Count);
        Assert.Contains("wisdom", quote.Tags);
        Assert.Contains("motivation", quote.Tags);
    }

    [Theory]
    [InlineData("quote")]
    [InlineData("proverb")]
    [InlineData("cadao")]
    [InlineData("saying")]
    public void Quote_Type_CanBeSet(string type)
    {
        // Arrange & Act
        var quote = new Quote { Type = type };

        // Assert
        Assert.Equal(type, quote.Type);
    }

    [Fact]
    public void Quote_CreatedAt_IsSetToUtcNow()
    {
        // Arrange
        var before = DateTime.UtcNow.AddSeconds(-1);
        
        // Act
        var quote = new Quote();
        var after = DateTime.UtcNow.AddSeconds(1);

        // Assert
        Assert.True(quote.CreatedAt >= before && quote.CreatedAt <= after);
        Assert.Equal(DateTimeKind.Utc, quote.CreatedAt.Kind);
    }

    [Fact]
    public void Quote_IsPublic_DefaultsToTrue()
    {
        // Arrange & Act
        var quote = new Quote();

        // Assert
        Assert.True(quote.IsPublic);
    }

    [Fact]
    public void Quote_CreatedBy_CanBeNull()
    {
        // Arrange & Act
        var quote = new Quote();

        // Assert
        Assert.Null(quote.CreatedBy);
    }

    [Fact]
    public void Quote_CreatedBy_CanBeSet()
    {
        // Arrange
        var userId = "user-123";
        var quote = new Quote { CreatedBy = userId };

        // Act & Assert
        Assert.Equal(userId, quote.CreatedBy);
    }
}
