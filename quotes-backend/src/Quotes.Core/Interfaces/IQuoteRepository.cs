using Quotes.Core.Entities;

namespace Quotes.Core.Interfaces;

public interface IQuoteRepository
{
    Task<IEnumerable<Quote>> GetAllAsync(string? category = null, string? language = null, string? author = null);
    Task<Quote?> GetByIdAsync(string id);
    Task<Quote> AddAsync(Quote quote);
    Task<Quote> UpdateAsync(Quote quote);
    Task DeleteAsync(string id);
    Task<int> CountAsync(string? category = null, string? language = null);
}
