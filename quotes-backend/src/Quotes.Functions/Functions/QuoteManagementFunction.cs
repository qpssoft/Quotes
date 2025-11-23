using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Quotes.Application.DTOs;
using Quotes.Application.UseCases;

namespace Quotes.Functions.Functions;

public class QuoteManagementFunction
{
    private readonly ILogger<QuoteManagementFunction> _logger;
    private readonly CreateQuoteUseCase _createQuoteUseCase;
    private readonly UpdateQuoteUseCase _updateQuoteUseCase;
    private readonly DeleteQuoteUseCase _deleteQuoteUseCase;
    private readonly GetUserQuotesUseCase _getUserQuotesUseCase;

    public QuoteManagementFunction(
        ILogger<QuoteManagementFunction> logger,
        CreateQuoteUseCase createQuoteUseCase,
        UpdateQuoteUseCase updateQuoteUseCase,
        DeleteQuoteUseCase deleteQuoteUseCase,
        GetUserQuotesUseCase getUserQuotesUseCase)
    {
        _logger = logger;
        _createQuoteUseCase = createQuoteUseCase;
        _updateQuoteUseCase = updateQuoteUseCase;
        _deleteQuoteUseCase = deleteQuoteUseCase;
        _getUserQuotesUseCase = getUserQuotesUseCase;
    }

    [Function("CreateQuote")]
    public async Task<HttpResponseData> CreateQuote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/quotes")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("CreateQuote called");

        try
        {
            var response = req.CreateResponse();
            AddCorsHeaders(response);

            // Check authentication
            if (!context.Items.ContainsKey("IsAuthenticated") || !(bool)context.Items["IsAuthenticated"])
            {
                response.StatusCode = HttpStatusCode.Unauthorized;
                await response.WriteAsJsonAsync(new { error = "Authentication required" });
                return response;
            }

            var userId = context.Items["UserId"]?.ToString();
            var role = context.Items["Role"]?.ToString() ?? "Authenticated";

            // Only Admin and Contributor can create quotes
            if (role != "Admin" && role != "Contributor")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Insufficient permissions. Contributor or Admin role required." });
                return response;
            }

            // Parse request body
            var body = await req.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(body))
            {
                response.StatusCode = HttpStatusCode.BadRequest;
                await response.WriteAsJsonAsync(new { error = "Request body is required" });
                return response;
            }

            var dto = JsonSerializer.Deserialize<CreateQuoteDto>(body, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (dto == null)
            {
                response.StatusCode = HttpStatusCode.BadRequest;
                await response.WriteAsJsonAsync(new { error = "Invalid request body" });
                return response;
            }

            // Create quote
            var quote = await _createQuoteUseCase.ExecuteAsync(dto, userId);

            response.StatusCode = HttpStatusCode.Created;
            await response.WriteAsJsonAsync(quote);
            return response;
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error creating quote");
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message });
            return errorResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating quote");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }

    [Function("UpdateQuote")]
    public async Task<HttpResponseData> UpdateQuote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/quotes/{id}")] HttpRequestData req,
        string id,
        FunctionContext context)
    {
        _logger.LogInformation($"UpdateQuote called for ID: {id}");

        try
        {
            var response = req.CreateResponse();
            AddCorsHeaders(response);

            // Check authentication
            if (!context.Items.ContainsKey("IsAuthenticated") || !(bool)context.Items["IsAuthenticated"])
            {
                response.StatusCode = HttpStatusCode.Unauthorized;
                await response.WriteAsJsonAsync(new { error = "Authentication required" });
                return response;
            }

            var role = context.Items["Role"]?.ToString() ?? "Authenticated";

            // Only Admin can update quotes
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin role required" });
                return response;
            }

            // Parse request body
            var body = await req.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(body))
            {
                response.StatusCode = HttpStatusCode.BadRequest;
                await response.WriteAsJsonAsync(new { error = "Request body is required" });
                return response;
            }

            var dto = JsonSerializer.Deserialize<UpdateQuoteDto>(body, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (dto == null)
            {
                response.StatusCode = HttpStatusCode.BadRequest;
                await response.WriteAsJsonAsync(new { error = "Invalid request body" });
                return response;
            }

            // Update quote
            var quote = await _updateQuoteUseCase.ExecuteAsync(id, dto);

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(quote);
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"Quote {id} not found");
            var errorResponse = req.CreateResponse(HttpStatusCode.NotFound);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message });
            return errorResponse;
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error updating quote");
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message });
            return errorResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating quote {id}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }

    [Function("DeleteQuote")]
    public async Task<HttpResponseData> DeleteQuote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/quotes/{id}")] HttpRequestData req,
        string id,
        FunctionContext context)
    {
        _logger.LogInformation($"DeleteQuote called for ID: {id}");

        try
        {
            var response = req.CreateResponse();
            AddCorsHeaders(response);

            // Check authentication
            if (!context.Items.ContainsKey("IsAuthenticated") || !(bool)context.Items["IsAuthenticated"])
            {
                response.StatusCode = HttpStatusCode.Unauthorized;
                await response.WriteAsJsonAsync(new { error = "Authentication required" });
                return response;
            }

            var role = context.Items["Role"]?.ToString() ?? "Authenticated";

            // Only Admin can delete quotes
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin role required" });
                return response;
            }

            // Delete quote
            await _deleteQuoteUseCase.ExecuteAsync(id);

            response.StatusCode = HttpStatusCode.NoContent;
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"Quote {id} not found");
            var errorResponse = req.CreateResponse(HttpStatusCode.NotFound);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message });
            return errorResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting quote {id}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }

    [Function("GetMyQuotes")]
    public async Task<HttpResponseData> GetMyQuotes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/users/me/quotes")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("GetMyQuotes called");

        try
        {
            var response = req.CreateResponse();
            AddCorsHeaders(response);

            // Check authentication
            if (!context.Items.ContainsKey("IsAuthenticated") || !(bool)context.Items["IsAuthenticated"])
            {
                response.StatusCode = HttpStatusCode.Unauthorized;
                await response.WriteAsJsonAsync(new { error = "Authentication required" });
                return response;
            }

            var userId = context.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
            {
                response.StatusCode = HttpStatusCode.Unauthorized;
                await response.WriteAsJsonAsync(new { error = "User ID not found in token" });
                return response;
            }

            // Get user quotes
            var quotes = await _getUserQuotesUseCase.ExecuteAsync(userId);

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(quotes);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user quotes");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }

    private void AddCorsHeaders(HttpResponseData response)
    {
        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.Headers.Add("Access-Control-Max-Age", "3600");
    }
}
