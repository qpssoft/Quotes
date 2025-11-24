using Quotes.Application.Common;
using Quotes.Application.DTOs;
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

        return QuoteMapper.ToDtos(userQuotes);
    }
}
