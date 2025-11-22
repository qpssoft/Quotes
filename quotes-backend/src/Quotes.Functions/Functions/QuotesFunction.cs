using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Quotes.Application.UseCases;
using Quotes.Infrastructure.Services;

namespace Quotes.Functions.Functions;

public class QuotesFunction
{
    private readonly ILogger<QuotesFunction> _logger;
    private readonly GetAllQuotesUseCase _getAllQuotesUseCase;
    private readonly GetQuoteByIdUseCase _getQuoteByIdUseCase;
    private readonly MemoryCacheService _cacheService;

    public QuotesFunction(
        ILogger<QuotesFunction> logger,
        GetAllQuotesUseCase getAllQuotesUseCase,
        GetQuoteByIdUseCase getQuoteByIdUseCase,
        MemoryCacheService cacheService)
    {
        _logger = logger;
        _getAllQuotesUseCase = getAllQuotesUseCase;
        _getQuoteByIdUseCase = getQuoteByIdUseCase;
        _cacheService = cacheService;
    }

    [Function("GetAllQuotes")]
    [OpenApiOperation(operationId: "GetAllQuotes", tags: new[] { "Quotes" }, Summary = "Get all quotes", Description = "Retrieve all quotes with optional filtering by category, language, and author")]
    [OpenApiParameter(name: "category", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by category")]
    [OpenApiParameter(name: "language", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by language (vi or en)")]
    [OpenApiParameter(name: "author", In = ParameterLocation.Query, Required = false, Type = typeof(string), Description = "Filter by author name")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(Application.DTOs.QuoteDto[]), Description = "List of quotes")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> GetAllQuotes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/quotes")] HttpRequestData req)
    {
        _logger.LogInformation("GetAllQuotes called");

        try
        {
            // Add CORS headers
            var response = req.CreateResponse();
            AddCorsHeaders(response);

            // Parse query parameters
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var category = query["category"];
            var language = query["language"];
            var author = query["author"];

            // Generate cache key
            var cacheKey = $"quotes_{category}_{language}_{author}";

            // Try cache
            if (_cacheService.TryGet<IEnumerable<Application.DTOs.QuoteDto>>(cacheKey, out var cachedQuotes) && cachedQuotes != null)
            {
                _logger.LogInformation("Returning cached quotes");
                response.StatusCode = HttpStatusCode.OK;
                await response.WriteAsJsonAsync(cachedQuotes);
                return response;
            }

            // Fetch from repository
            var quotes = await _getAllQuotesUseCase.ExecuteAsync(category, language, author);

            // Cache results
            _cacheService.Set(cacheKey, quotes, TimeSpan.FromMinutes(5));

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(quotes);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting quotes");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }

    [Function("GetQuoteById")]
    [OpenApiOperation(operationId: "GetQuoteById", tags: new[] { "Quotes" }, Summary = "Get quote by ID", Description = "Retrieve a single quote by its unique identifier")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "Quote ID")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(Application.DTOs.QuoteDto), Description = "Quote found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "Quote not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> GetQuoteById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/quotes/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation($"GetQuoteById called for ID: {id}");

        try
        {
            // Add CORS headers
            var response = req.CreateResponse();
            AddCorsHeaders(response);

            // Try cache
            var cacheKey = $"quote_{id}";
            if (_cacheService.TryGet<Application.DTOs.QuoteDto>(cacheKey, out var cachedQuote) && cachedQuote != null)
            {
                _logger.LogInformation("Returning cached quote");
                response.StatusCode = HttpStatusCode.OK;
                await response.WriteAsJsonAsync(cachedQuote);
                return response;
            }

            // Fetch from repository
            var quote = await _getQuoteByIdUseCase.ExecuteAsync(id);

            if (quote == null)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                AddCorsHeaders(notFoundResponse);
                await notFoundResponse.WriteAsJsonAsync(new { error = "Quote not found" });
                return notFoundResponse;
            }

            // Cache result
            _cacheService.Set(cacheKey, quote, TimeSpan.FromMinutes(5));

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(quote);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting quote {id}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }

    [Function("Health")]
    public HttpResponseData Health(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] HttpRequestData req)
    {
        _logger.LogInformation("Health check called");
        var response = req.CreateResponse(HttpStatusCode.OK);
        AddCorsHeaders(response);
        response.WriteString("Healthy");
        return response;
    }

    private void AddCorsHeaders(HttpResponseData response)
    {
        // Allow multiple origins for development and production
        var allowedOrigins = new[]
        {
            "http://localhost:4200",  // Angular dev
            "http://localhost:3000",  // React dev
            "http://localhost:5173",  // Vite dev
            "https://*.github.io",    // GitHub Pages (wildcard not supported, need specific)
            "file://*"                // Electron/React Native (wildcard not supported)
        };

        response.Headers.Add("Access-Control-Allow-Origin", "*"); // For MVP, allow all
        response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.Headers.Add("Access-Control-Max-Age", "3600");
    }
}
