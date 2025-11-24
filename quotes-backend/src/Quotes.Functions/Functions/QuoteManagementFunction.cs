using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
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
    [OpenApiOperation(operationId: "CreateQuote", tags: new[] { "Quote Management" }, Summary = "Create new quote", Description = "Create a new quote (Contributor or Admin only)")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(CreateQuoteDto), Required = true, Description = "Quote data")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Created, contentType: "application/json", bodyType: typeof(QuoteDto), Description = "Quote created successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(object), Description = "Invalid quote data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Contributor or Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
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
    [OpenApiOperation(operationId: "UpdateQuote", tags: new[] { "Quote Management" }, Summary = "Update quote", Description = "Update an existing quote (Admin only)")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "Quote ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateQuoteDto), Required = true, Description = "Updated quote data")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(QuoteDto), Description = "Quote updated successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(object), Description = "Invalid quote data")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "Quote not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
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
    [OpenApiOperation(operationId: "DeleteQuote", tags: new[] { "Quote Management" }, Summary = "Delete quote", Description = "Delete an existing quote (Admin only)")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "Quote ID")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NoContent, contentType: "application/json", bodyType: typeof(void), Description = "Quote deleted successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "Quote not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
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
    [OpenApiOperation(operationId: "GetMyQuotes", tags: new[] { "Quote Management" }, Summary = "Get my quotes", Description = "Retrieve all quotes created by the authenticated user")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(QuoteDto[]), Description = "List of user's quotes")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
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
