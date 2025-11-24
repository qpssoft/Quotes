using Moq;
using Quotes.Application.DTOs;
using Quotes.Application.UseCases;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;
using Xunit;

namespace Quotes.Application.Tests.UseCases;

public class CreateQuoteUseCaseTests
{
    private readonly Mock<IQuoteRepository> _mockRepository;
    private readonly CreateQuoteUseCase _useCase;

    public CreateQuoteUseCaseTests()
    {
        _mockRepository = new Mock<IQuoteRepository>();
        _useCase = new CreateQuoteUseCase(_mockRepository.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WithValidDto_CreatesQuote()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Test quote content",
            Author = "Test Author",
            Category = "wisdom",
            Tags = new List<string> { "test" },
            Language = "vi",
            Type = "quote",
            IsPublic = true
        };

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Quote>()))
            .ReturnsAsync((Quote q) => q);

        // Act
        var result = await _useCase.ExecuteAsync(dto, "user-123");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Content, result.Content);
        Assert.Equal(dto.Author, result.Author);
        Assert.Equal(dto.Category, result.Category);
        Assert.Equal(dto.Language, result.Language);
        Assert.Equal("user-123", result.CreatedBy);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Quote>()), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_GeneratesUniqueId()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Test",
            Author = "Author",
            Language = "vi"
        };

        Quote? capturedQuote = null;
        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Quote>()))
            .Callback<Quote>(q => capturedQuote = q)
            .ReturnsAsync((Quote q) => q);

        // Act
        await _useCase.ExecuteAsync(dto);

        // Assert
        Assert.NotNull(capturedQuote);
        Assert.False(string.IsNullOrEmpty(capturedQuote.Id));
        Assert.True(Guid.TryParse(capturedQuote.Id, out _));
    }

    [Fact]
    public async Task ExecuteAsync_SetsCreatedAtToUtcNow()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Test",
            Author = "Author",
            Language = "vi"
        };

        var before = DateTime.UtcNow.AddSeconds(-1);
        Quote? capturedQuote = null;
        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Quote>()))
            .Callback<Quote>(q => capturedQuote = q)
            .ReturnsAsync((Quote q) => q);

        // Act
        await _useCase.ExecuteAsync(dto);
        var after = DateTime.UtcNow.AddSeconds(1);

        // Assert
        Assert.NotNull(capturedQuote);
        Assert.True(capturedQuote.CreatedAt >= before && capturedQuote.CreatedAt <= after);
        Assert.Equal(DateTimeKind.Utc, capturedQuote.CreatedAt.Kind);
    }

    [Fact]
    public async Task ExecuteAsync_WithUserId_SetsCreatedBy()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Test",
            Author = "Author",
            Language = "vi"
        };
        var userId = "user-456";

        Quote? capturedQuote = null;
        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Quote>()))
            .Callback<Quote>(q => capturedQuote = q)
            .ReturnsAsync((Quote q) => q);

        // Act
        await _useCase.ExecuteAsync(dto, userId);

        // Assert
        Assert.NotNull(capturedQuote);
        Assert.Equal(userId, capturedQuote.CreatedBy);
    }

    [Fact]
    public async Task ExecuteAsync_WithoutUserId_SetsCreatedByToNull()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Test",
            Author = "Author",
            Language = "vi"
        };

        Quote? capturedQuote = null;
        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Quote>()))
            .Callback<Quote>(q => capturedQuote = q)
            .ReturnsAsync((Quote q) => q);

        // Act
        await _useCase.ExecuteAsync(dto);

        // Assert
        Assert.NotNull(capturedQuote);
        Assert.Null(capturedQuote.CreatedBy);
    }

    [Fact]
    public async Task ExecuteAsync_WithEmptyTags_InitializesEmptyList()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Test",
            Author = "Author",
            Language = "vi",
            Tags = null
        };

        Quote? capturedQuote = null;
        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Quote>()))
            .Callback<Quote>(q => capturedQuote = q)
            .ReturnsAsync((Quote q) => q);

        // Act
        await _useCase.ExecuteAsync(dto);

        // Assert
        Assert.NotNull(capturedQuote);
        Assert.NotNull(capturedQuote.Tags);
        Assert.Empty(capturedQuote.Tags);
    }

    [Fact]
    public async Task ExecuteAsync_WithInvalidContent_ThrowsArgumentException()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "", // Invalid: empty content
            Author = "Author",
            Language = "vi"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _useCase.ExecuteAsync(dto));
        Assert.Contains("Content is required", exception.Message);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Quote>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_WithInvalidAuthor_ThrowsArgumentException()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Valid content",
            Author = "", // Invalid: empty author
            Language = "vi"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _useCase.ExecuteAsync(dto));
        Assert.Contains("Author is required", exception.Message);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Quote>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_WithInvalidLanguage_ThrowsArgumentException()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Valid content",
            Author = "Author",
            Language = "fr" // Invalid: unsupported language
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _useCase.ExecuteAsync(dto));
        Assert.Contains("Language must be 'vi' or 'en'", exception.Message);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Quote>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_WithContentExceedingMaxLength_ThrowsArgumentException()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = new string('a', Quote.MaxContentLength + 1),
            Author = "Author",
            Language = "vi"
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _useCase.ExecuteAsync(dto));
        Assert.Contains("Content must not exceed", exception.Message);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Quote>()), Times.Never);
    }

    [Fact]
    public async Task ExecuteAsync_MapsAllDtoPropertiesToEntity()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Test content",
            Author = "Test Author",
            Category = "Test Category",
            Tags = new List<string> { "tag1", "tag2" },
            Language = "en",
            Type = "proverb",
            IsPublic = false
        };

        Quote? capturedQuote = null;
        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Quote>()))
            .Callback<Quote>(q => capturedQuote = q)
            .ReturnsAsync((Quote q) => q);

        // Act
        await _useCase.ExecuteAsync(dto);

        // Assert
        Assert.NotNull(capturedQuote);
        Assert.Equal(dto.Content, capturedQuote.Content);
        Assert.Equal(dto.Author, capturedQuote.Author);
        Assert.Equal(dto.Category, capturedQuote.Category);
        Assert.Equal(dto.Tags, capturedQuote.Tags);
        Assert.Equal(dto.Language, capturedQuote.Language);
        Assert.Equal(dto.Type, capturedQuote.Type);
        Assert.Equal(dto.IsPublic, capturedQuote.IsPublic);
    }

    [Fact]
    public async Task ExecuteAsync_ReturnsCreatedQuoteAsDto()
    {
        // Arrange
        var dto = new CreateQuoteDto
        {
            Content = "Test",
            Author = "Author",
            Language = "vi"
        };

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Quote>()))
            .ReturnsAsync((Quote q) => q);

        // Act
        var result = await _useCase.ExecuteAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.IsType<QuoteDto>(result);
        Assert.Equal(dto.Content, result.Content);
        Assert.Equal(dto.Author, result.Author);
    }
}
