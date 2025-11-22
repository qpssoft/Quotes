using SendGrid;
using SendGrid.Helpers.Mail;
using Quotes.Core.Interfaces;

namespace Quotes.Infrastructure.Services;

public class SendGridEmailService : IEmailService
{
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public SendGridEmailService(string apiKey, string fromEmail = "noreply@quotes-app.com", string fromName = "Quotes App")
    {
        _apiKey = apiKey;
        _fromEmail = fromEmail;
        _fromName = fromName;
    }

    public async Task SendNotificationAsync(string to, string subject, string body)
    {
        var client = new SendGridClient(_apiKey);
        var from = new EmailAddress(_fromEmail, _fromName);
        var toAddress = new EmailAddress(to);
        var msg = MailHelper.CreateSingleEmail(from, toAddress, subject, body, body);

        try
        {
            var response = await client.SendEmailAsync(msg);
            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Body.ReadAsStringAsync();
                throw new InvalidOperationException($"Failed to send email: {response.StatusCode}, {responseBody}");
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to send email to {to}", ex);
        }
    }
}
