using Quotes.Application.DTOs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class SubmitUserQuoteUseCase
{
    private readonly IQuoteRepository _quoteRepository;
    private readonly IEmailService _emailService;
    private readonly string _adminEmail = "quangphamsoftvn@gmail.com";

    public SubmitUserQuoteUseCase(IQuoteRepository quoteRepository, IEmailService emailService)
    {
        _quoteRepository = quoteRepository;
        _emailService = emailService;
    }

    public async Task<QuoteDto> ExecuteAsync(CreateQuoteDto dto, string userId)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(dto.Content))
            throw new ArgumentException("Content is required");
        if (dto.Content.Length > Quote.MaxContentLength)
            throw new ArgumentException($"Content must not exceed {Quote.MaxContentLength} characters");
        if (string.IsNullOrWhiteSpace(dto.Author))
            throw new ArgumentException("Author is required");
        if (dto.Author.Length > Quote.MaxAuthorLength)
            throw new ArgumentException($"Author must not exceed {Quote.MaxAuthorLength} characters");

        var quote = new Quote
        {
            Content = dto.Content,
            Author = dto.Author,
            Category = dto.Category,
            Tags = dto.Tags,
            Language = dto.Language,
            Type = dto.Type,
            CreatedBy = userId,
            IsPublic = false // User submissions start as private
        };

        var savedQuote = await _quoteRepository.AddAsync(quote);

        // Send notification to admin
        try
        {
            await _emailService.SendNotificationAsync(
                _adminEmail,
                "New Quote Submission",
                $"A new quote has been submitted by user {userId}:\n\nContent: {quote.Content}\nAuthor: {quote.Author}\nCategory: {quote.Category}"
            );
        }
        catch
        {
            // Log but don't fail if email fails
        }

        return new QuoteDto
        {
            Id = savedQuote.Id,
            Content = savedQuote.Content,
            Author = savedQuote.Author,
            Category = savedQuote.Category,
            Tags = savedQuote.Tags,
            Language = savedQuote.Language,
            Type = savedQuote.Type,
            CreatedAt = savedQuote.CreatedAt,
            CreatedBy = savedQuote.CreatedBy,
            IsPublic = savedQuote.IsPublic
        };
    }
}
