namespace Quotes.Core.Entities;

public class UserQuoteSubmission
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string QuoteId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public string? RejectionReason { get; set; }

    // Navigation
    public Quote? Quote { get; set; }
    public User? User { get; set; }
}
