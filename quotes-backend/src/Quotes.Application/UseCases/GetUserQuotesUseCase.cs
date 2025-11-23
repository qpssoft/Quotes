using Quotes.Application.DTOs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class GetUserQuotesUseCase
{
    private readonly IQuoteRepository _quoteRepository;

    public GetUserQuotesUseCase(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<IEnumerable<QuoteDto>> ExecuteAsync(string userId)
    {
        // Get all quotes and filter by userId
        var allQuotes = await _quoteRepository.GetAllAsync();
        var userQuotes = allQuotes.Where(q => q.CreatedBy == userId);

        return userQuotes.Select(MapToDto);
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
