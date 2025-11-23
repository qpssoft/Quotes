using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Quotes.Application.UseCases;
using Quotes.Core.Interfaces;
using System.Net;
using System.Text.Json;

namespace Quotes.Functions.Functions;

public class AdminQuotesFunction
{
    private readonly ILogger<AdminQuotesFunction> _logger;
    private readonly IQuoteRepository _quoteRepository;
    private readonly ApproveQuoteUseCase _approveQuoteUseCase;
    private readonly RejectQuoteUseCase _rejectQuoteUseCase;

    public AdminQuotesFunction(
        ILogger<AdminQuotesFunction> logger,
        IQuoteRepository quoteRepository,
        ApproveQuoteUseCase approveQuoteUseCase,
        RejectQuoteUseCase rejectQuoteUseCase)
    {
        _logger = logger;
        _quoteRepository = quoteRepository;
        _approveQuoteUseCase = approveQuoteUseCase;
        _rejectQuoteUseCase = rejectQuoteUseCase;
    }

    [Function("GetSubmissions")]
    public async Task<HttpResponseData> GetSubmissions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/admin/submissions")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("GetSubmissions endpoint called");

        var response = req.CreateResponse();
        AddCorsHeaders(response);

        if (req.Method == "OPTIONS")
        {
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }

        try
        {
            // Check authentication
            if (!context.Items.ContainsKey("IsAuthenticated") || !(bool)context.Items["IsAuthenticated"])
            {
                response.StatusCode = HttpStatusCode.Unauthorized;
                await response.WriteAsJsonAsync(new { error = "Authentication required" });
                return response;
            }

            // Check admin role
            var role = context.Items["Role"]?.ToString() ?? "Authenticated";
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin access required" });
                return response;
            }

            // For now, return empty array since we don't have user submission storage yet
            // This will be implemented when user submission feature is added
            var submissions = new List<object>();
            
            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(submissions);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting submissions");
            response.StatusCode = HttpStatusCode.InternalServerError;
            await response.WriteAsJsonAsync(new { error = "Internal server error" });
            return response;
        }
    }

    [Function("ApproveQuote")]
    public async Task<HttpResponseData> ApproveQuote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/admin/quotes/{id}/approve")] HttpRequestData req,
        FunctionContext context,
        string id)
    {
        _logger.LogInformation($"ApproveQuote endpoint called for quote ID: {id}");

        var response = req.CreateResponse();
        AddCorsHeaders(response);

        if (req.Method == "OPTIONS")
        {
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }

        try
        {
            // Check authentication
            if (!context.Items.ContainsKey("IsAuthenticated") || !(bool)context.Items["IsAuthenticated"])
            {
                response.StatusCode = HttpStatusCode.Unauthorized;
                await response.WriteAsJsonAsync(new { error = "Authentication required" });
                return response;
            }

            // Check admin role
            var role = context.Items["Role"]?.ToString() ?? "Authenticated";
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin access required" });
                return response;
            }

            var userId = context.Items["UserId"]?.ToString();
            await _approveQuoteUseCase.ExecuteAsync(id, userId);

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(new { message = "Quote approved successfully" });
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"Quote not found: {id}");
            response.StatusCode = HttpStatusCode.NotFound;
            await response.WriteAsJsonAsync(new { error = $"Quote with ID {id} not found" });
            return response;
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, $"Invalid quote data: {id}");
            response.StatusCode = HttpStatusCode.BadRequest;
            await response.WriteAsJsonAsync(new { error = ex.Message });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error approving quote {id}");
            response.StatusCode = HttpStatusCode.InternalServerError;
            await response.WriteAsJsonAsync(new { error = "Internal server error" });
            return response;
        }
    }

    [Function("RejectQuote")]
    public async Task<HttpResponseData> RejectQuote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/admin/quotes/{id}/reject")] HttpRequestData req,
        FunctionContext context,
        string id)
    {
        _logger.LogInformation($"RejectQuote endpoint called for quote ID: {id}");

        var response = req.CreateResponse();
        AddCorsHeaders(response);

        if (req.Method == "OPTIONS")
        {
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }

        try
        {
            // Check authentication
            if (!context.Items.ContainsKey("IsAuthenticated") || !(bool)context.Items["IsAuthenticated"])
            {
                response.StatusCode = HttpStatusCode.Unauthorized;
                await response.WriteAsJsonAsync(new { error = "Authentication required" });
                return response;
            }

            // Check admin role
            var role = context.Items["Role"]?.ToString() ?? "Authenticated";
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin access required" });
                return response;
            }

            // Read rejection reason from request body (optional)
            string? rejectionReason = null;
            try
            {
                var body = await new StreamReader(req.Body).ReadToEndAsync();
                if (!string.IsNullOrWhiteSpace(body))
                {
                    var data = JsonSerializer.Deserialize<Dictionary<string, string>>(body);
                    if (data != null && data.ContainsKey("reason"))
                    {
                        rejectionReason = data["reason"];
                    }
                }
            }
            catch
            {
                // Ignore parse errors for rejection reason
            }

            var userId = context.Items["UserId"]?.ToString();
            await _rejectQuoteUseCase.ExecuteAsync(id, userId, rejectionReason);

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(new { message = "Quote rejected successfully" });
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"Quote not found: {id}");
            response.StatusCode = HttpStatusCode.NotFound;
            await response.WriteAsJsonAsync(new { error = $"Quote with ID {id} not found" });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error rejecting quote {id}");
            response.StatusCode = HttpStatusCode.InternalServerError;
            await response.WriteAsJsonAsync(new { error = "Internal server error" });
            return response;
        }
    }

    private void AddCorsHeaders(HttpResponseData response)
    {
        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
}
