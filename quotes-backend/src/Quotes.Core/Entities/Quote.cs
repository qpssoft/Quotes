namespace Quotes.Core.Entities;

public class Quote
{
    public string Id { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public string Language { get; set; } = "vi"; // vi or en
    public string Type { get; set; } = "quote"; // quote, proverb, cadao
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public bool IsPublic { get; set; } = true;

    // Validation
    public const int MaxContentLength = 500;
    public const int MaxAuthorLength = 100;

    public bool IsValid(out List<string> errors)
    {
        errors = new List<string>();

        if (string.IsNullOrWhiteSpace(Content))
            errors.Add("Content is required");
        else if (Content.Length > MaxContentLength)
            errors.Add($"Content must not exceed {MaxContentLength} characters");

        if (string.IsNullOrWhiteSpace(Author))
            errors.Add("Author is required");
        else if (Author.Length > MaxAuthorLength)
            errors.Add($"Author must not exceed {MaxAuthorLength} characters");

        if (string.IsNullOrWhiteSpace(Language))
            errors.Add("Language is required");

        if (!new[] { "vi", "en" }.Contains(Language.ToLower()))
            errors.Add("Language must be 'vi' or 'en'");

        return errors.Count == 0;
    }
}
