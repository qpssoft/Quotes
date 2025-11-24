using Quotes.Application.Common;
using Quotes.Application.DTOs;
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
        return QuoteMapper.ToDtos(quotes);
    }
}
