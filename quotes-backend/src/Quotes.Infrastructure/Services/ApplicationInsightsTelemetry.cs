using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;

namespace Quotes.Infrastructure.Services;

public class ApplicationInsightsTelemetry
{
    private readonly TelemetryClient _telemetryClient;

    public ApplicationInsightsTelemetry(TelemetryClient telemetryClient)
    {
        _telemetryClient = telemetryClient;
    }

    public void TrackEvent(string eventName, Dictionary<string, string>? properties = null)
    {
        _telemetryClient.TrackEvent(eventName, properties);
    }

    public void TrackException(Exception exception, Dictionary<string, string>? properties = null)
    {
        _telemetryClient.TrackException(exception, properties);
    }

    public void TrackTrace(string message, SeverityLevel severity = SeverityLevel.Information, Dictionary<string, string>? properties = null)
    {
        _telemetryClient.TrackTrace(message, severity, properties);
    }

    public void TrackMetric(string name, double value, Dictionary<string, string>? properties = null)
    {
        _telemetryClient.TrackMetric(name, value, properties);
    }

    public void TrackRequest(string name, DateTimeOffset startTime, TimeSpan duration, string responseCode, bool success)
    {
        var request = new RequestTelemetry
        {
            Name = name,
            Timestamp = startTime,
            Duration = duration,
            ResponseCode = responseCode,
            Success = success
        };
        _telemetryClient.TrackRequest(request);
    }
}
