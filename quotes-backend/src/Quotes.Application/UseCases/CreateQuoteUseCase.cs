using Quotes.Application.DTOs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class CreateQuoteUseCase
{
    private readonly IQuoteRepository _quoteRepository;

    public CreateQuoteUseCase(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<QuoteDto> ExecuteAsync(CreateQuoteDto dto, string? userId = null)
    {
        // Create quote entity
        var quote = new Quote
        {
            Id = Guid.NewGuid().ToString(),
            Content = dto.Content,
            Author = dto.Author,
            Category = dto.Category,
            Tags = dto.Tags ?? new List<string>(),
            Language = dto.Language,
            Type = dto.Type,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId,
            IsPublic = dto.IsPublic
        };

        // Validate
        if (!quote.IsValid(out var errors))
        {
            throw new ArgumentException(string.Join(", ", errors));
        }

        // Save to repository
        var created = await _quoteRepository.AddAsync(quote);

        return MapToDto(created);
    }

    private QuoteDto MapToDto(Quote quote)
    {
        return new QuoteDto
        {
            Id = quote.Id,
            Content = quote.Content,
            Author = quote.Author,
            Category = quote.Category,
            Tags = quote.Tags,
            Language = quote.Language,
            Type = quote.Type,
            CreatedAt = quote.CreatedAt,
            CreatedBy = quote.CreatedBy,
            IsPublic = quote.IsPublic
        };
    }
}
