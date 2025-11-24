using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace Quotes.Functions.Common;

/// <summary>
/// Centralized response creation helpers
/// </summary>
public static class ResponseHelper
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    /// <summary>
    /// Creates a success response with JSON body
    /// </summary>
    public static async Task<HttpResponseData> CreateSuccessResponse<T>(
        HttpRequestData req,
        T data,
        HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        var response = req.CreateResponse(statusCode);
        // CORS headers are added by CorsMiddleware
        await response.WriteAsJsonAsync(data);
        return response;
    }

    /// <summary>
    /// Creates a no-content response
    /// </summary>
    public static HttpResponseData CreateNoContentResponse(HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.NoContent);
        // CORS headers are added by CorsMiddleware
        return response;
    }

    /// <summary>
    /// Creates a bad request response
    /// </summary>
    public static async Task<HttpResponseData> CreateBadRequestResponse(
        HttpRequestData req,
        string message)
    {
        var response = req.CreateResponse(HttpStatusCode.BadRequest);
        // CORS headers are added by CorsMiddleware
        await response.WriteAsJsonAsync(new { error = message });
        return response;
    }

    /// <summary>
    /// Creates a not found response
    /// </summary>
    public static async Task<HttpResponseData> CreateNotFoundResponse(
        HttpRequestData req,
        string message)
    {
        var response = req.CreateResponse(HttpStatusCode.NotFound);
        // CORS headers are added by CorsMiddleware
        await response.WriteAsJsonAsync(new { error = message });
        return response;
    }

    /// <summary>
    /// Creates an internal server error response
    /// </summary>
    public static async Task<HttpResponseData> CreateErrorResponse(
        HttpRequestData req,
        ILogger logger,
        Exception ex,
        string message = "Internal server error")
    {
        logger.LogError(ex, message);
        var response = req.CreateResponse(HttpStatusCode.InternalServerError);
        // CORS headers are added by CorsMiddleware
        await response.WriteAsJsonAsync(new { error = message });
        return response;
    }

    /// <summary>
    /// Parses request body to DTO
    /// </summary>
    public static async Task<T?> ParseRequestBody<T>(HttpRequestData req) where T : class
    {
        var body = await req.ReadAsStringAsync();
        if (string.IsNullOrWhiteSpace(body))
            return null;

        return JsonSerializer.Deserialize<T>(body, JsonOptions);
    }
}
