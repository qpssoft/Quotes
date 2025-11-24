using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Quotes.Application.DTOs;
using Quotes.Application.UseCases;
using Quotes.Functions.Common;

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
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            var userId = AuthorizationHelper.GetUserId(context);
            
            // Only Admin and Contributor can create quotes
            if (!AuthorizationHelper.HasRole(context, "Admin", "Contributor"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Contributor or Admin role required");

            // Parse request body
            var dto = await ResponseHelper.ParseRequestBody<CreateQuoteDto>(req);
            if (dto == null)
                return await ResponseHelper.CreateBadRequestResponse(req, "Request body is required");

            // Create quote
            var quote = await _createQuoteUseCase.ExecuteAsync(dto, userId);

            return await ResponseHelper.CreateSuccessResponse(req, quote, HttpStatusCode.Created);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error creating quote");
            return await ResponseHelper.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, "Error creating quote");
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
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Only Admin can update quotes
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin role required");

            // Parse request body
            var dto = await ResponseHelper.ParseRequestBody<UpdateQuoteDto>(req);
            if (dto == null)
                return await ResponseHelper.CreateBadRequestResponse(req, "Invalid request body");

            // Update quote
            var quote = await _updateQuoteUseCase.ExecuteAsync(id, dto);

            return await ResponseHelper.CreateSuccessResponse(req, quote);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"Quote {id} not found");
            return await ResponseHelper.CreateNotFoundResponse(req, ex.Message);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error updating quote");
            return await ResponseHelper.CreateBadRequestResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, $"Error updating quote {id}");
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
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Only Admin can delete quotes
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin role required");

            // Delete quote
            await _deleteQuoteUseCase.ExecuteAsync(id);

            return ResponseHelper.CreateNoContentResponse(req);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"Quote {id} not found");
            return await ResponseHelper.CreateNotFoundResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, $"Error deleting quote {id}");
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
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            var userId = AuthorizationHelper.GetUserId(context);
            if (string.IsNullOrEmpty(userId))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req, "User ID not found in token");

            // Get user quotes
            var quotes = await _getUserQuotesUseCase.ExecuteAsync(userId);

            return await ResponseHelper.CreateSuccessResponse(req, quotes);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, "Error getting user quotes");
        }
    }
}
