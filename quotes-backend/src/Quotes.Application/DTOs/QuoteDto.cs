namespace Quotes.Application.DTOs;

public class QuoteDto
{
    public string Id { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public string Language { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public bool IsPublic { get; set; }
}

public class CreateQuoteDto
{
    public string Content { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<string>? Tags { get; set; }
    public string Language { get; set; } = "vi";
    public string Type { get; set; } = "quote";
    public bool IsPublic { get; set; } = true;
}

public class UpdateQuoteDto
{
    public string? Content { get; set; }
    public string? Author { get; set; }
    public string? Category { get; set; }
    public List<string>? Tags { get; set; }
    public string? Language { get; set; }
    public string? Type { get; set; }
    public bool? IsPublic { get; set; }
}
