using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Quotes.Application.DTOs;
using Quotes.Application.UseCases;

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

            // Only Admin can view users
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin role required" });
                return response;
            }

            // Get all users
            var users = await _getAllUsersUseCase.ExecuteAsync();

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(users);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
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

            // Only Admin can view user details
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin role required" });
                return response;
            }

            // Get user
            var user = await _getUserByIdUseCase.ExecuteAsync(id);

            if (user == null)
            {
                response.StatusCode = HttpStatusCode.NotFound;
                await response.WriteAsJsonAsync(new { error = "User not found" });
                return response;
            }

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(user);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting user {id}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
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

            // Only Admin can update users
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

            var dto = JsonSerializer.Deserialize<UpdateUserDto>(body, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (dto == null)
            {
                response.StatusCode = HttpStatusCode.BadRequest;
                await response.WriteAsJsonAsync(new { error = "Invalid request body" });
                return response;
            }

            // Update user
            var user = await _updateUserUseCase.ExecuteAsync(id, dto);

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(user);
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"User {id} not found");
            var errorResponse = req.CreateResponse(HttpStatusCode.NotFound);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message });
            return errorResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating user {id}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
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

            // Only Admin can delete users
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin role required" });
                return response;
            }

            // Delete user
            await _deleteUserUseCase.ExecuteAsync(id);

            response.StatusCode = HttpStatusCode.NoContent;
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"User {id} not found");
            var errorResponse = req.CreateResponse(HttpStatusCode.NotFound);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message });
            return errorResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting user {id}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
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

            // Only Admin can ban users
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin role required" });
                return response;
            }

            // Ban user
            var user = await _banUserUseCase.ExecuteAsync(id, banned: true);

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(user);
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"User {id} not found");
            var errorResponse = req.CreateResponse(HttpStatusCode.NotFound);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message });
            return errorResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error banning user {id}");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
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

            // Only Admin can unban users
            if (role != "Admin")
            {
                response.StatusCode = HttpStatusCode.Forbidden;
                await response.WriteAsJsonAsync(new { error = "Admin role required" });
                return response;
            }

            // Unban user
            var user = await _banUserUseCase.ExecuteAsync(id, banned: false);

            response.StatusCode = HttpStatusCode.OK;
            await response.WriteAsJsonAsync(user);
            return response;
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, $"User {id} not found");
            var errorResponse = req.CreateResponse(HttpStatusCode.NotFound);
            AddCorsHeaders(errorResponse);
            await errorResponse.WriteAsJsonAsync(new { error = ex.Message });
            return errorResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error unbanning user {id}");
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
