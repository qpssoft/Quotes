using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
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
