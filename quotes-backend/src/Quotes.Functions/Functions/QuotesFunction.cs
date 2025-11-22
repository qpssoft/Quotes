using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
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
    public async Task<HttpResponseData> GetAllQuotes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/quotes")] HttpRequestData req)
    {
        _logger.LogInformation("GetAllQuotes called");

        try
        {
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
                var cachedResponse = req.CreateResponse(HttpStatusCode.OK);
                await cachedResponse.WriteAsJsonAsync(cachedQuotes);
                return cachedResponse;
            }

            // Fetch from repository
            var quotes = await _getAllQuotesUseCase.ExecuteAsync(category, language, author);

            // Cache results
            _cacheService.Set(cacheKey, quotes, TimeSpan.FromMinutes(5));

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(quotes);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting quotes");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }

    [Function("GetQuoteById")]
    public async Task<HttpResponseData> GetQuoteById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/quotes/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation($"GetQuoteById called for ID: {id}");

        try
        {
            // Try cache
            var cacheKey = $"quote_{id}";
            if (_cacheService.TryGet<Application.DTOs.QuoteDto>(cacheKey, out var cachedQuote) && cachedQuote != null)
            {
                _logger.LogInformation("Returning cached quote");
                var cachedResponse = req.CreateResponse(HttpStatusCode.OK);
                await cachedResponse.WriteAsJsonAsync(cachedQuote);
                return cachedResponse;
            }

            // Fetch from repository
            var quote = await _getQuoteByIdUseCase.ExecuteAsync(id);

            if (quote == null)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(new { error = "Quote not found" });
                return notFoundResponse;
            }

            // Cache result
            _cacheService.Set(cacheKey, quote, TimeSpan.FromMinutes(5));

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(quote);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting quote {id}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
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
        response.WriteString("Healthy");
        return response;
    }
}
