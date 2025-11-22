namespace Quotes.Core.Entities;

public class AuditLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? UserId { get; set; }
    public string Action { get; set; } = string.Empty; // Created, Updated, Deleted, Approved, Rejected, BannedUser, etc.
    public string? TargetId { get; set; }
    public string? TargetType { get; set; } // Quote, User, UserQuoteSubmission
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Dictionary<string, string> Details { get; set; } = new();
}
