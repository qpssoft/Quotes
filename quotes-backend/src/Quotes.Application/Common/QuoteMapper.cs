using Quotes.Application.DTOs;
using Quotes.Core.Entities;

namespace Quotes.Application.Common;

/// <summary>
/// Centralized mapper for Quote entity to DTO conversions
/// </summary>
public static class QuoteMapper
{
    /// <summary>
    /// Maps a Quote entity to a QuoteDto
    /// </summary>
    public static QuoteDto ToDto(Quote quote)
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

    /// <summary>
    /// Maps a collection of Quote entities to QuoteDtos
    /// </summary>
    public static IEnumerable<QuoteDto> ToDtos(IEnumerable<Quote> quotes)
    {
        return quotes.Select(ToDto);
    }
}
