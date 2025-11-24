using Moq;
using Quotes.Application.DTOs;
using Quotes.Application.UseCases;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;
using Xunit;

namespace Quotes.Application.Tests.UseCases;

public class GetAllQuotesUseCaseTests
{
    private readonly Mock<IQuoteRepository> _mockRepository;
    private readonly GetAllQuotesUseCase _useCase;

    public GetAllQuotesUseCaseTests()
    {
        _mockRepository = new Mock<IQuoteRepository>();
        _useCase = new GetAllQuotesUseCase(_mockRepository.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WithNoFilters_ReturnsAllQuotes()
    {
        // Arrange
        var quotes = new List<Quote>
        {
            new Quote { Id = "1", Content = "Quote 1", Author = "Author 1", Language = "vi" },
            new Quote { Id = "2", Content = "Quote 2", Author = "Author 2", Language = "en" }
        };
        _mockRepository.Setup(r => r.GetAllAsync(null, null, null))
            .ReturnsAsync(quotes);

        // Act
        var result = await _useCase.ExecuteAsync();

        // Assert
        Assert.Equal(2, result.Count());
        _mockRepository.Verify(r => r.GetAllAsync(null, null, null), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WithLanguageFilter_ReturnsFilteredQuotes()
    {
        // Arrange
        var quotes = new List<Quote>
        {
            new Quote { Id = "1", Content = "Vietnamese Quote", Author = "Author", Language = "vi" }
        };
        _mockRepository.Setup(r => r.GetAllAsync(null, "vi", null))
            .ReturnsAsync(quotes);

        // Act
        var result = await _useCase.ExecuteAsync(language: "vi");

        // Assert
        Assert.Single(result);
        Assert.Equal("vi", result.First().Language);
        _mockRepository.Verify(r => r.GetAllAsync(null, "vi", null), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WithCategoryFilter_ReturnsFilteredQuotes()
    {
        // Arrange
        var quotes = new List<Quote>
        {
            new Quote { Id = "1", Content = "Wisdom Quote", Author = "Author", Category = "wisdom", Language = "vi" }
        };
        _mockRepository.Setup(r => r.GetAllAsync("wisdom", null, null))
            .ReturnsAsync(quotes);

        // Act
        var result = await _useCase.ExecuteAsync(category: "wisdom");

        // Assert
        Assert.Single(result);
        Assert.Equal("wisdom", result.First().Category);
        _mockRepository.Verify(r => r.GetAllAsync("wisdom", null, null), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WithAuthorFilter_ReturnsFilteredQuotes()
    {
        // Arrange
        var author = "Buddha";
        var quotes = new List<Quote>
        {
            new Quote { Id = "1", Content = "Quote", Author = author, Language = "vi" }
        };
        _mockRepository.Setup(r => r.GetAllAsync(null, null, author))
            .ReturnsAsync(quotes);

        // Act
        var result = await _useCase.ExecuteAsync(author: author);

        // Assert
        Assert.Single(result);
        Assert.Equal(author, result.First().Author);
        _mockRepository.Verify(r => r.GetAllAsync(null, null, author), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WithMultipleFilters_ReturnsFilteredQuotes()
    {
        // Arrange
        var quotes = new List<Quote>
        {
            new Quote 
            { 
                Id = "1", 
                Content = "Quote", 
                Author = "Buddha", 
                Category = "wisdom", 
                Language = "vi" 
            }
        };
        _mockRepository.Setup(r => r.GetAllAsync("wisdom", "vi", "Buddha"))
            .ReturnsAsync(quotes);

        // Act
        var result = await _useCase.ExecuteAsync(category: "wisdom", language: "vi", author: "Buddha");

        // Assert
        Assert.Single(result);
        var quote = result.First();
        Assert.Equal("wisdom", quote.Category);
        Assert.Equal("vi", quote.Language);
        Assert.Equal("Buddha", quote.Author);
        _mockRepository.Verify(r => r.GetAllAsync("wisdom", "vi", "Buddha"), Times.Once);
    }

    [Fact]
    public async Task ExecuteAsync_WhenNoQuotesFound_ReturnsEmptyCollection()
    {
        // Arrange
        _mockRepository.Setup(r => r.GetAllAsync(null, null, null))
            .ReturnsAsync(new List<Quote>());

        // Act
        var result = await _useCase.ExecuteAsync();

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task ExecuteAsync_MapsQuotePropertiesToDto()
    {
        // Arrange
        var quote = new Quote
        {
            Id = "test-id",
            Content = "Test content",
            Author = "Test Author",
            Category = "Test Category",
            Tags = new List<string> { "tag1", "tag2" },
            Language = "en",
            Type = "quote",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "user-123",
            IsPublic = true
        };
        _mockRepository.Setup(r => r.GetAllAsync(null, null, null))
            .ReturnsAsync(new List<Quote> { quote });

        // Act
        var result = await _useCase.ExecuteAsync();
        var dto = result.First();

        // Assert
        Assert.Equal(quote.Id, dto.Id);
        Assert.Equal(quote.Content, dto.Content);
        Assert.Equal(quote.Author, dto.Author);
        Assert.Equal(quote.Category, dto.Category);
        Assert.Equal(quote.Tags, dto.Tags);
        Assert.Equal(quote.Language, dto.Language);
        Assert.Equal(quote.Type, dto.Type);
        Assert.Equal(quote.CreatedAt, dto.CreatedAt);
        Assert.Equal(quote.CreatedBy, dto.CreatedBy);
        Assert.Equal(quote.IsPublic, dto.IsPublic);
    }
}
