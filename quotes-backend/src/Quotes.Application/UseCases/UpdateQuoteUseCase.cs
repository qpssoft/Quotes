using Quotes.Application.DTOs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class UpdateQuoteUseCase
{
    private readonly IQuoteRepository _quoteRepository;

    public UpdateQuoteUseCase(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<QuoteDto> ExecuteAsync(string id, UpdateQuoteDto dto)
    {
        // Get existing quote
        var existingQuote = await _quoteRepository.GetByIdAsync(id);
        if (existingQuote == null)
        {
            throw new KeyNotFoundException($"Quote with ID {id} not found");
        }

        // Update fields
        if (!string.IsNullOrWhiteSpace(dto.Content))
            existingQuote.Content = dto.Content;

        if (!string.IsNullOrWhiteSpace(dto.Author))
            existingQuote.Author = dto.Author;

        if (!string.IsNullOrWhiteSpace(dto.Category))
            existingQuote.Category = dto.Category;

        if (dto.Tags != null)
            existingQuote.Tags = dto.Tags;

        if (!string.IsNullOrWhiteSpace(dto.Language))
            existingQuote.Language = dto.Language;

        if (!string.IsNullOrWhiteSpace(dto.Type))
            existingQuote.Type = dto.Type;

        if (dto.IsPublic.HasValue)
            existingQuote.IsPublic = dto.IsPublic.Value;

        // Validate
        if (!existingQuote.IsValid(out var errors))
        {
            throw new ArgumentException(string.Join(", ", errors));
        }

        // Save
        var updated = await _quoteRepository.UpdateAsync(existingQuote);

        return MapToDto(updated);
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
