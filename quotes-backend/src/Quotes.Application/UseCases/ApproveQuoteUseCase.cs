using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class ApproveQuoteUseCase
{
    private readonly IQuoteRepository _quoteRepository;

    public ApproveQuoteUseCase(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<bool> ExecuteAsync(string quoteId, string adminUserId)
    {
        var quote = await _quoteRepository.GetByIdAsync(quoteId);
        if (quote == null)
            throw new InvalidOperationException($"Quote with ID {quoteId} not found");

        // Mark as public
        quote.IsPublic = true;
        await _quoteRepository.UpdateAsync(quote);

        return true;
    }
}
