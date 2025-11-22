using Quotes.Application.DTOs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class GetAllQuotesUseCase
{
    private readonly IQuoteRepository _quoteRepository;

    public GetAllQuotesUseCase(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<IEnumerable<QuoteDto>> ExecuteAsync(string? category = null, string? language = null, string? author = null)
    {
        var quotes = await _quoteRepository.GetAllAsync(category, language, author);
        return quotes.Select(MapToDto);
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
