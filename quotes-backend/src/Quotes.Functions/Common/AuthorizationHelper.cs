using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace Quotes.Functions.Common;

/// <summary>
/// Centralized authentication and authorization helpers
/// </summary>
public static class AuthorizationHelper
{
    /// <summary>
    /// Checks if the request is authenticated
    /// </summary>
    public static bool IsAuthenticated(FunctionContext context)
    {
        return context.Items.ContainsKey("IsAuthenticated") && 
               (bool)context.Items["IsAuthenticated"];
    }

    /// <summary>
    /// Gets the user ID from the context
    /// </summary>
    public static string? GetUserId(FunctionContext context)
    {
        return context.Items.ContainsKey("UserId") 
            ? context.Items["UserId"]?.ToString() 
            : null;
    }

    /// <summary>
    /// Gets the user role from the context
    /// </summary>
    public static string GetUserRole(FunctionContext context)
    {
        return context.Items.ContainsKey("Role") 
            ? context.Items["Role"]?.ToString() ?? "Authenticated" 
            : "Authenticated";
    }

    /// <summary>
    /// Checks if the user has the required role
    /// </summary>
    public static bool HasRole(FunctionContext context, params string[] requiredRoles)
    {
        var userRole = GetUserRole(context);
        return requiredRoles.Contains(userRole);
    }

    /// <summary>
    /// Creates an unauthorized response
    /// </summary>
    public static async Task<HttpResponseData> CreateUnauthorizedResponse(
        HttpRequestData req, 
        string message = "Authentication required")
    {
        var response = req.CreateResponse(HttpStatusCode.Unauthorized);
        // CORS headers are added by CorsMiddleware
        await response.WriteAsJsonAsync(new { error = message });
        return response;
    }

    /// <summary>
    /// Creates a forbidden response
    /// </summary>
    public static async Task<HttpResponseData> CreateForbiddenResponse(
        HttpRequestData req, 
        string message = "Insufficient permissions")
    {
        var response = req.CreateResponse(HttpStatusCode.Forbidden);
        // CORS headers are added by CorsMiddleware
        await response.WriteAsJsonAsync(new { error = message });
        return response;
    }
}
