using System.Collections.Concurrent;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.Logging;

namespace Quotes.Functions.Middleware;

public class RateLimitingMiddleware : IFunctionsWorkerMiddleware
{
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private static readonly ConcurrentDictionary<string, RateLimitInfo> _rateLimits = new();
    private static readonly TimeSpan _window = TimeSpan.FromMinutes(1);

    public RateLimitingMiddleware(ILogger<RateLimitingMiddleware> logger)
    {
        _logger = logger;
    }

    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        var requestData = await context.GetHttpRequestDataAsync();
        if (requestData == null)
        {
            await next(context);
            return;
        }

        // Get user identity or IP
        var userId = context.Items.TryGetValue("UserId", out var userIdValue) ? userIdValue?.ToString() : null;
        var clientIp = requestData.Headers.TryGetValues("X-Forwarded-For", out var forwardedFor)
            ? forwardedFor.FirstOrDefault()?.Split(',')[0].Trim()
            : requestData.Headers.TryGetValues("X-Real-IP", out var realIp)
                ? realIp.FirstOrDefault()
                : "unknown";

        var key = userId ?? clientIp ?? "anonymous";

        // Determine role-based limit
        var role = context.Items.TryGetValue("Role", out var roleValue) ? roleValue?.ToString() : "Anonymous";
        var limit = role switch
        {
            "Admin" => 1000,
            "Authenticated" => 500,
            "Contributor" => 500,
            _ => 100 // Anonymous
        };

        // Check rate limit
        var now = DateTime.UtcNow;
        var rateLimitInfo = _rateLimits.GetOrAdd(key, _ => new RateLimitInfo());

        bool isLimitExceeded = false;
        int retryAfterSeconds = 0;

        lock (rateLimitInfo)
        {
            // Reset if window expired
            if (now - rateLimitInfo.WindowStart > _window)
            {
                rateLimitInfo.WindowStart = now;
                rateLimitInfo.RequestCount = 0;
            }

            // Check limit
            if (rateLimitInfo.RequestCount >= limit)
            {
                isLimitExceeded = true;
                retryAfterSeconds = (int)(_window - (now - rateLimitInfo.WindowStart)).TotalSeconds;
            }
            else
            {
                rateLimitInfo.RequestCount++;
            }
        }

        if (isLimitExceeded)
        {
            _logger.LogWarning($"Rate limit exceeded for {key} (role: {role})");
            
            var response = requestData.CreateResponse(System.Net.HttpStatusCode.TooManyRequests);
            await response.WriteAsJsonAsync(new
            {
                error = "Rate limit exceeded",
                retryAfter = retryAfterSeconds.ToString()
            });
            
            response.Headers.Add("Retry-After", retryAfterSeconds.ToString());
            context.GetInvocationResult().Value = response;
            return;
        }

        await next(context);
    }

    private class RateLimitInfo
    {
        public DateTime WindowStart { get; set; } = DateTime.UtcNow;
        public int RequestCount { get; set; }
    }
}
