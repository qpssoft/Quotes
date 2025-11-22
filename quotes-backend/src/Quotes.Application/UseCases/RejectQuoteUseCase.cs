using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class RejectQuoteUseCase
{
    private readonly IQuoteRepository _quoteRepository;
    private readonly IEmailService _emailService;

    public RejectQuoteUseCase(IQuoteRepository quoteRepository, IEmailService emailService)
    {
        _quoteRepository = quoteRepository;
        _emailService = emailService;
    }

    public async Task<bool> ExecuteAsync(string quoteId, string adminUserId, string? rejectionReason = null)
    {
        var quote = await _quoteRepository.GetByIdAsync(quoteId);
        if (quote == null)
            throw new InvalidOperationException($"Quote with ID {quoteId} not found");

        // Delete the quote
        await _quoteRepository.DeleteAsync(quoteId);

        // Optionally notify the submitter
        // This would require storing user email with the quote or looking it up

        return true;
    }
}
