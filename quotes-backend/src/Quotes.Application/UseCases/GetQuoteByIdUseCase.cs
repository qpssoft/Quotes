using Quotes.Application.Common;
using Quotes.Application.DTOs;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class GetQuoteByIdUseCase
{
    private readonly IQuoteRepository _quoteRepository;

    public GetQuoteByIdUseCase(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<QuoteDto?> ExecuteAsync(string id)
    {
        var quote = await _quoteRepository.GetByIdAsync(id);
        return quote == null ? null : QuoteMapper.ToDto(quote);
    }
}
