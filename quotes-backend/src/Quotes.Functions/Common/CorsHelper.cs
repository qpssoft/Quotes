using Microsoft.Azure.Functions.Worker.Http;

namespace Quotes.Functions.Common;

/// <summary>
/// Centralized CORS header management
/// </summary>
public static class CorsHelper
{
    private const string AllowOrigin = "*";
    private const string AllowMethods = "GET, POST, PUT, DELETE, OPTIONS";
    private const string AllowHeaders = "Content-Type, Authorization";
    private const string MaxAge = "3600";

    /// <summary>
    /// Adds standard CORS headers to the response
    /// </summary>
    public static void AddCorsHeaders(HttpResponseData response)
    {
        response.Headers.Add("Access-Control-Allow-Origin", AllowOrigin);
        response.Headers.Add("Access-Control-Allow-Methods", AllowMethods);
        response.Headers.Add("Access-Control-Allow-Headers", AllowHeaders);
        response.Headers.Add("Access-Control-Max-Age", MaxAge);
    }
}
