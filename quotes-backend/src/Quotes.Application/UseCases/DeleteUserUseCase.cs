using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class DeleteUserUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly IQuoteRepository _quoteRepository;

    public DeleteUserUseCase(IUserRepository userRepository, IQuoteRepository quoteRepository)
    {
        _userRepository = userRepository;
        _quoteRepository = quoteRepository;
    }

    public async Task ExecuteAsync(string userId)
    {
        // Check if user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        // Delete all user's quotes
        var allQuotes = await _quoteRepository.GetAllAsync();
        var userQuotes = allQuotes.Where(q => q.CreatedBy == userId).ToList();
        
        foreach (var quote in userQuotes)
        {
            await _quoteRepository.DeleteAsync(quote.Id);
        }

        // Delete user
        await _userRepository.DeleteAsync(userId);
    }
}
