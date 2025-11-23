using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class DeleteQuoteUseCase
{
    private readonly IQuoteRepository _quoteRepository;

    public DeleteQuoteUseCase(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task ExecuteAsync(string id)
    {
        // Check if quote exists
        var quote = await _quoteRepository.GetByIdAsync(id);
        if (quote == null)
        {
            throw new KeyNotFoundException($"Quote with ID {id} not found");
        }

        // Delete
        await _quoteRepository.DeleteAsync(id);
    }
}
