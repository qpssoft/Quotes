using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Quotes.Application.UseCases;
using Quotes.Core.Interfaces;
using Quotes.Functions.Common;
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
    [OpenApiOperation(operationId: "GetSubmissions", tags: new[] { "Admin" }, Summary = "Get user quote submissions", Description = "Retrieve all pending user-submitted quotes awaiting admin approval (Admin only)")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(Application.DTOs.QuoteDto[]), Description = "List of pending submissions")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> GetSubmissions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/admin/submissions")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("GetSubmissions endpoint called");

        if (req.Method == "OPTIONS")
        {
            var optionsResponse = req.CreateResponse(HttpStatusCode.OK);
            CorsHelper.AddCorsHeaders(optionsResponse);
            return optionsResponse;
        }

        try
        {
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Check admin role
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin access required");

            // For now, return empty array since we don't have user submission storage yet
            // This will be implemented when user submission feature is added
            var submissions = new List<object>();
            
            return await ResponseHelper.CreateSuccessResponse(req, submissions);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, "Error getting submissions");
        }
    }

    [Function("ApproveQuote")]
    [OpenApiOperation(operationId: "ApproveQuote", tags: new[] { "Admin" }, Summary = "Approve submitted quote", Description = "Approve a user-submitted quote and publish it (Admin only)")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "Quote ID")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(object), Description = "Quote approved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(object), Description = "Invalid quote data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "Quote not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> ApproveQuote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/admin/quotes/{id}/approve")] HttpRequestData req,
        FunctionContext context,
        string id)
    {
        _logger.LogInformation($"ApproveQuote endpoint called for quote ID: {id}");

        if (req.Method == "OPTIONS")
        {
            var optionsResponse = req.CreateResponse(HttpStatusCode.OK);
            CorsHelper.AddCorsHeaders(optionsResponse);
            return optionsResponse;
        }

        try
        {
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Check admin role
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin access required");

            var userId = AuthorizationHelper.GetUserId(context);
            await _approveQuoteUseCase.ExecuteAsync(id, userId);

            return await ResponseHelper.CreateSuccessResponse(req, new { message = "Quote approved successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"Quote not found: {id}");
            return await ResponseHelper.CreateNotFoundResponse(req, $"Quote with ID {id} not found");
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, $"Invalid quote data: {id}");
            return await ResponseHelper.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, $"Error approving quote {id}");
        }
    }

    [Function("RejectQuote")]
    [OpenApiOperation(operationId: "RejectQuote", tags: new[] { "Admin" }, Summary = "Reject submitted quote", Description = "Reject a user-submitted quote with optional reason (Admin only)")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "Quote ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(Dictionary<string, string>), Required = false, Description = "Rejection reason (optional: { \"reason\": \"text\" })")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(object), Description = "Quote rejected successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(object), Description = "Invalid quote data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "Quote not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> RejectQuote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/admin/quotes/{id}/reject")] HttpRequestData req,
        FunctionContext context,
        string id)
    {
        _logger.LogInformation($"RejectQuote endpoint called for quote ID: {id}");

        if (req.Method == "OPTIONS")
        {
            var optionsResponse = req.CreateResponse(HttpStatusCode.OK);
            CorsHelper.AddCorsHeaders(optionsResponse);
            return optionsResponse;
        }

        try
        {
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Check admin role
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin access required");

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

            var userId = AuthorizationHelper.GetUserId(context);
            await _rejectQuoteUseCase.ExecuteAsync(id, userId, rejectionReason);

            return await ResponseHelper.CreateSuccessResponse(req, new { message = "Quote rejected successfully" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"Quote not found: {id}");
            return await ResponseHelper.CreateNotFoundResponse(req, $"Quote with ID {id} not found");
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, $"Error rejecting quote {id}");
        }
    }
}
