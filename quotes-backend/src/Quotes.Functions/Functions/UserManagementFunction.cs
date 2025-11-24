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

public class UserManagementFunction
{
    private readonly ILogger<UserManagementFunction> _logger;
    private readonly GetAllUsersUseCase _getAllUsersUseCase;
    private readonly GetUserByIdUseCase _getUserByIdUseCase;
    private readonly UpdateUserUseCase _updateUserUseCase;
    private readonly DeleteUserUseCase _deleteUserUseCase;
    private readonly BanUserUseCase _banUserUseCase;

    public UserManagementFunction(
        ILogger<UserManagementFunction> logger,
        GetAllUsersUseCase getAllUsersUseCase,
        GetUserByIdUseCase getUserByIdUseCase,
        UpdateUserUseCase updateUserUseCase,
        DeleteUserUseCase deleteUserUseCase,
        BanUserUseCase banUserUseCase)
    {
        _logger = logger;
        _getAllUsersUseCase = getAllUsersUseCase;
        _getUserByIdUseCase = getUserByIdUseCase;
        _updateUserUseCase = updateUserUseCase;
        _deleteUserUseCase = deleteUserUseCase;
        _banUserUseCase = banUserUseCase;
    }

    [Function("GetAllUsers")]
    [OpenApiOperation(operationId: "GetAllUsers", tags: new[] { "User Management" }, Summary = "Get all users", Description = "Retrieve all users (Admin only)")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(UserDto[]), Description = "List of all users")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> GetAllUsers(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/admin/users")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("GetAllUsers called");

        try
        {
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Only Admin can view users
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin role required");

            // Get all users
            var users = await _getAllUsersUseCase.ExecuteAsync();

            return await ResponseHelper.CreateSuccessResponse(req, users);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, "Error getting users");
        }
    }

    [Function("GetUserById")]
    [OpenApiOperation(operationId: "GetUserById", tags: new[] { "User Management" }, Summary = "Get user by ID", Description = "Retrieve a specific user's details (Admin only)")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The user ID")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(UserDto), Description = "User details")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "User not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> GetUserById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/admin/users/{id}")] HttpRequestData req,
        string id,
        FunctionContext context)
    {
        _logger.LogInformation($"GetUserById called for ID: {id}");

        try
        {
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Only Admin can view user details
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin role required");

            // Get user
            var user = await _getUserByIdUseCase.ExecuteAsync(id);

            if (user == null)
                return await ResponseHelper.CreateNotFoundResponse(req, "User not found");

            return await ResponseHelper.CreateSuccessResponse(req, user);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, $"Error getting user {id}");
        }
    }

    [Function("UpdateUser")]
    [OpenApiOperation(operationId: "UpdateUser", tags: new[] { "User Management" }, Summary = "Update user", Description = "Update a user's details (Admin only)")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The user ID")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(UpdateUserDto), Required = true, Description = "User update data")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(UserDto), Description = "Updated user")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(object), Description = "Invalid request body")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "User not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> UpdateUser(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/admin/users/{id}")] HttpRequestData req,
        string id,
        FunctionContext context)
    {
        _logger.LogInformation($"UpdateUser called for ID: {id}");

        try
        {
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Only Admin can update users
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin role required");

            // Parse request body
            var dto = await ResponseHelper.ParseRequestBody<UpdateUserDto>(req);
            if (dto == null)
                return await ResponseHelper.CreateBadRequestResponse(req, "Invalid request body");

            // Update user
            var user = await _updateUserUseCase.ExecuteAsync(id, dto);

            return await ResponseHelper.CreateSuccessResponse(req, user);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"User {id} not found");
            return await ResponseHelper.CreateNotFoundResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, $"Error updating user {id}");
        }
    }

    [Function("DeleteUser")]
    [OpenApiOperation(operationId: "DeleteUser", tags: new[] { "User Management" }, Summary = "Delete user", Description = "Delete a user (Admin only)")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The user ID")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NoContent, contentType: "application/json", bodyType: typeof(void), Description = "User deleted successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "User not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> DeleteUser(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "v1/admin/users/{id}")] HttpRequestData req,
        string id,
        FunctionContext context)
    {
        _logger.LogInformation($"DeleteUser called for ID: {id}");

        try
        {
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Only Admin can delete users
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin role required");

            // Delete user
            await _deleteUserUseCase.ExecuteAsync(id);

            return ResponseHelper.CreateNoContentResponse(req);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"User {id} not found");
            return await ResponseHelper.CreateNotFoundResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, $"Error deleting user {id}");
        }
    }

    [Function("BanUser")]
    [OpenApiOperation(operationId: "BanUser", tags: new[] { "User Management" }, Summary = "Ban user", Description = "Ban a user (Admin only)")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The user ID")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(UserDto), Description = "Banned user")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "User not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> BanUser(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/admin/users/{id}/ban")] HttpRequestData req,
        string id,
        FunctionContext context)
    {
        _logger.LogInformation($"BanUser called for ID: {id}");

        try
        {
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Only Admin can ban users
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin role required");

            // Ban user
            var user = await _banUserUseCase.ExecuteAsync(id, banned: true);

            return await ResponseHelper.CreateSuccessResponse(req, user);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"User {id} not found");
            return await ResponseHelper.CreateNotFoundResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, $"Error banning user {id}");
        }
    }

    [Function("UnbanUser")]
    [OpenApiOperation(operationId: "UnbanUser", tags: new[] { "User Management" }, Summary = "Unban user", Description = "Unban a user (Admin only)")]
    [OpenApiParameter(name: "id", In = ParameterLocation.Path, Required = true, Type = typeof(string), Description = "The user ID")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(UserDto), Description = "Unbanned user")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Forbidden, contentType: "application/json", bodyType: typeof(object), Description = "Admin role required")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "User not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> UnbanUser(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "v1/admin/users/{id}/unban")] HttpRequestData req,
        string id,
        FunctionContext context)
    {
        _logger.LogInformation($"UnbanUser called for ID: {id}");

        try
        {
            // Check authentication
            if (!AuthorizationHelper.IsAuthenticated(context))
                return await AuthorizationHelper.CreateUnauthorizedResponse(req);

            // Only Admin can unban users
            if (!AuthorizationHelper.HasRole(context, "Admin"))
                return await AuthorizationHelper.CreateForbiddenResponse(req, "Admin role required");

            // Unban user
            var user = await _banUserUseCase.ExecuteAsync(id, banned: false);

            return await ResponseHelper.CreateSuccessResponse(req, user);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"User {id} not found");
            return await ResponseHelper.CreateNotFoundResponse(req, ex.Message);
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, $"Error unbanning user {id}");
        }
    }
}
