using System.Net;
using System.Security.Claims;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.Logging;
using Quotes.Infrastructure.Auth;
using Quotes.Infrastructure.Services;

namespace Quotes.Functions.Middleware;

public class AuthenticationMiddleware : IFunctionsWorkerMiddleware
{
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthenticationMiddleware> _logger;
    private readonly ApplicationInsightsTelemetry _telemetry;

    public AuthenticationMiddleware(
        IJwtTokenService jwtTokenService,
        ILogger<AuthenticationMiddleware> logger,
        ApplicationInsightsTelemetry telemetry)
    {
        _jwtTokenService = jwtTokenService;
        _logger = logger;
        _telemetry = telemetry;
    }

    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        var requestData = await context.GetHttpRequestDataAsync();
        if (requestData != null)
        {
            // Extract Authorization header
            if (requestData.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                var authHeader = authHeaders.FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    var token = authHeader.Substring("Bearer ".Length).Trim();
                    var principal = _jwtTokenService.ValidateToken(token);

                    if (principal != null)
                    {
                        // Store user info in context for access in functions
                        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        var role = principal.FindFirst(ClaimTypes.Role)?.Value ?? "Authenticated";
                        var email = principal.FindFirst(ClaimTypes.Email)?.Value;
                        
                        context.Items["UserId"] = userId;
                        context.Items["Role"] = role;
                        context.Items["Email"] = email;
                        context.Items["IsAuthenticated"] = true;
                        
                        _telemetry.TrackEvent("TokenValidated", new Dictionary<string, string>
                        {
                            { "UserId", userId ?? "unknown" },
                            { "Email", email ?? "unknown" },
                            { "Role", role }
                        });
                    }
                    else
                    {
                        context.Items["IsAuthenticated"] = false;
                        _telemetry.TrackEvent("TokenValidationFailed", new Dictionary<string, string>
                        {
                            { "Reason", "Invalid token" }
                        });
                    }
                }
                else
                {
                    context.Items["IsAuthenticated"] = false;
                }
            }
            else
            {
                context.Items["IsAuthenticated"] = false;
            }
        }

        await next(context);
    }
}

public static class FunctionContextAuthExtensions
{
    public static bool IsAuthenticated(this FunctionContext context)
    {
        return context.Items.TryGetValue("IsAuthenticated", out var isAuth) && isAuth is bool auth && auth;
    }

    public static string? GetUserId(this FunctionContext context)
    {
        context.Items.TryGetValue("UserId", out var userId);
        return userId as string;
    }

    public static string GetUserRole(this FunctionContext context)
    {
        context.Items.TryGetValue("Role", out var role);
        return role as string ?? "Anonymous";
    }

    public static string? GetUserEmail(this FunctionContext context)
    {
        context.Items.TryGetValue("Email", out var email);
        return email as string;
    }

    public static HttpResponseData CreateUnauthorizedResponse(this HttpRequestData request)
    {
        var response = request.CreateResponse(HttpStatusCode.Unauthorized);
        response.Headers.Add("Content-Type", "application/json");
        response.WriteString("{\"error\":\"Unauthorized\",\"message\":\"Valid authentication token required\"}");
        return response;
    }

    public static HttpResponseData CreateForbiddenResponse(this HttpRequestData request, string message = "Insufficient permissions")
    {
        var response = request.CreateResponse(HttpStatusCode.Forbidden);
        response.Headers.Add("Content-Type", "application/json");
        response.WriteString($"{{\"error\":\"Forbidden\",\"message\":\"{message}\"}}");
        return response;
    }
}
