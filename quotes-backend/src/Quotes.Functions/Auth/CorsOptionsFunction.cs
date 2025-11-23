using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;

namespace Quotes.Functions.Auth;

/// <summary>
/// Handles CORS preflight (OPTIONS) requests for all API endpoints
/// This is necessary because Azure Functions Isolated Worker doesn't handle
/// OPTIONS requests in middleware before routing
/// </summary>
public class CorsOptionsFunction
{
    private readonly string[] _allowedOrigins = new[]
    {
        "http://localhost:3000",    // React Admin Center (dev)
        "http://localhost:4200",    // Angular Platform (dev)
        "http://localhost:5173",    // Vite (dev)
    };

    [Function("CorsOptions")]
    public HttpResponseData Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "options", Route = "{*any}")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.NoContent);

        // Get the Origin header
        var origin = req.Headers.TryGetValues("Origin", out var origins) 
            ? origins.FirstOrDefault() 
            : null;

        // Check if origin is allowed
        if (origin != null && IsOriginAllowed(origin))
        {
            response.Headers.Add("Access-Control-Allow-Origin", origin);
            response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            response.Headers.Add("Access-Control-Allow-Credentials", "true");
            response.Headers.Add("Access-Control-Max-Age", "86400"); // 24 hours
        }

        return response;
    }

    private bool IsOriginAllowed(string origin)
    {
        // Allow all localhost origins for development
        if (origin.StartsWith("http://localhost", StringComparison.OrdinalIgnoreCase) ||
            origin.StartsWith("https://localhost", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // Check against allowed origins (supports wildcards)
        return _allowedOrigins.Any(allowed =>
            allowed.Contains("*")
                ? origin.Contains(allowed.Replace("*.", ""))
                : origin.Equals(allowed, StringComparison.OrdinalIgnoreCase));
    }
}
