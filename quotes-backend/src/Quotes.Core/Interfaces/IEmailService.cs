namespace Quotes.Core.Interfaces;

public interface IEmailService
{
    Task SendNotificationAsync(string to, string subject, string body);
}
