using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;
using Quotes.Infrastructure.Auth;
using Quotes.Functions.Middleware;
using Quotes.Infrastructure.Services;
using Quotes.Functions.Common;

namespace Quotes.Functions.Functions;

public class AuthFunction
{
    private readonly ILogger<AuthFunction> _logger;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUserRepository _userRepository;
    private readonly ApplicationInsightsTelemetry _telemetry;

    public AuthFunction(
        ILogger<AuthFunction> logger,
        IJwtTokenService jwtTokenService,
        IUserRepository userRepository,
        ApplicationInsightsTelemetry telemetry)
    {
        _logger = logger;
        _jwtTokenService = jwtTokenService;
        _userRepository = userRepository;
        _telemetry = telemetry;
    }

    [Function("Login")]
    [OpenApiOperation(operationId: "Login", tags: new[] { "Authentication" }, Summary = "User login", Description = "Authenticate user with email and password, returns JWT access and refresh tokens")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(object), Required = true, Description = "Login credentials (email, password, name, provider)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(object), Description = "Login successful, returns tokens and user info")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(object), Description = "Invalid request (missing email/password)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Invalid credentials")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> Login(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/auth/login")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Login request received");
        LoginRequest? loginRequest = null;

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            loginRequest = JsonSerializer.Deserialize<LoginRequest>(requestBody, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });

            if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Email))
                return await ResponseHelper.CreateBadRequestResponse(req, "Email is required");

            // For MVP: Create or get user (simplified - no actual OAuth provider integration yet)
            var user = await _userRepository.GetByEmailAsync(loginRequest.Email);
            
            if (user == null)
            {
                // Special handling for root admin
                var isRootAdmin = loginRequest.Email.Equals("root@quotes.com", StringComparison.OrdinalIgnoreCase);
                
                // Create new user
                user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = loginRequest.Email,
                    Name = loginRequest.Name ?? loginRequest.Email.Split('@')[0],
                    Provider = loginRequest.Provider ?? "email",
                    Role = isRootAdmin ? "Admin" : "Authenticated",
                    CreatedAt = DateTime.UtcNow,
                    LastLogin = DateTime.UtcNow,
                    IsActive = true
                };

                // Add special claims for root admin
                if (isRootAdmin)
                {
                    user.Claims = new Dictionary<string, string>
                    {
                        { "IsRootAdmin", "true" },
                        { "CanManageUsers", "true" },
                        { "CanManageQuotes", "true" },
                        { "CanAccessAllFeatures", "true" }
                    };
                    _logger.LogInformation("Creating root admin user");
                }

                await _userRepository.AddAsync(user);
                _logger.LogInformation($"New user created: {user.Id}");
                _telemetry.TrackEvent("UserCreated", new Dictionary<string, string>
                {
                    { "UserId", user.Id },
                    { "Email", user.Email },
                    { "Provider", user.Provider }
                });
            }
            else
            {
                // Update last login
                user.LastLogin = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
            }

            // Generate tokens
            var accessToken = _jwtTokenService.GenerateAccessToken(user);
            var refreshToken = _jwtTokenService.GenerateRefreshToken();
            
            // Store refresh token
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await _userRepository.UpdateAsync(user);
            
            _telemetry.TrackEvent("UserLogin", new Dictionary<string, string>
            {
                { "UserId", user.Id },
                { "Email", user.Email },
                { "Provider", user.Provider }
            });

            return await ResponseHelper.CreateSuccessResponse(req, new
            {
                accessToken,
                refreshToken,
                expiresIn = 3600, // 1 hour
                user = new
                {
                    user.Id,
                    user.Email,
                    user.Name,
                    user.Role,
                    user.Provider,
                    user.ProfilePicture
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            _telemetry.TrackException(ex, new Dictionary<string, string>
            {
                { "Operation", "Login" },
                { "Email", loginRequest?.Email ?? "unknown" }
            });
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, "Error during login");
        }
    }

    [Function("GetCurrentUser")]    [OpenApiOperation(operationId: "GetCurrentUser", tags: new[] { "Authentication" }, Summary = "Get current user", Description = "Retrieve authenticated user's profile information")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(Application.DTOs.UserDto), Description = "User profile retrieved successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated or invalid token")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Description = "User not found")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]    public async Task<HttpResponseData> GetCurrentUser(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/users/me")] HttpRequestData req,
        FunctionContext context)
    {
        if (!context.IsAuthenticated())
            return req.CreateUnauthorizedResponse();

        var userId = context.GetUserId();
        if (string.IsNullOrEmpty(userId))
            return req.CreateUnauthorizedResponse();

        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return await ResponseHelper.CreateNotFoundResponse(req, "User not found");

            return await ResponseHelper.CreateSuccessResponse(req, new
            {
                user.Id,
                user.Email,
                user.Name,
                user.Role,
                user.Provider,
                user.ProfilePicture,
                user.CreatedAt,
                user.LastLogin
            });
        }
        catch (Exception ex)
        {
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, "Error getting user profile");
        }
    }

    [Function("Logout")]
    [OpenApiOperation(operationId: "Logout", tags: new[] { "Authentication" }, Summary = "User logout", Description = "Invalidate user's refresh token and log out")]
    [OpenApiSecurity("bearer_auth", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(object), Description = "Logout successful")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Not authenticated")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> Logout(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/auth/logout")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Logout request received");

        try
        {
            // If authenticated, invalidate refresh token
            if (context.IsAuthenticated())
            {
                var userId = context.GetUserId();
                if (!string.IsNullOrEmpty(userId))
                {
                    var user = await _userRepository.GetByIdAsync(userId);
                    if (user != null)
                    {
                        user.RefreshToken = null;
                        user.RefreshTokenExpiry = null;
                        await _userRepository.UpdateAsync(user);
                        _logger.LogInformation($"User {userId} logged out, refresh token invalidated");
                        _telemetry.TrackEvent("UserLogout", new Dictionary<string, string>
                        {
                            { "UserId", userId },
                            { "Email", user.Email }
                        });
                    }
                }
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.WriteString("{\"message\":\"Logged out successfully\"}");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            _telemetry.TrackException(ex, new Dictionary<string, string>
            {
                { "Operation", "Logout" }
            });
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, "Error during logout");
        }
    }
    
    [Function("RefreshToken")]
    [OpenApiOperation(operationId: "RefreshToken", tags: new[] { "Authentication" }, Summary = "Refresh access token", Description = "Exchange refresh token for new access and refresh tokens")]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(object), Required = true, Description = "Refresh token (refreshToken field)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(object), Description = "Tokens refreshed successfully")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(object), Description = "Invalid request (missing refresh token)")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.Unauthorized, contentType: "application/json", bodyType: typeof(object), Description = "Invalid or expired refresh token")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Description = "Internal server error")]
    public async Task<HttpResponseData> RefreshToken(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "v1/auth/refresh")] HttpRequestData req,
        FunctionContext context)
    {
        _logger.LogInformation("Token refresh request received");

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var refreshRequest = JsonSerializer.Deserialize<RefreshTokenRequest>(requestBody, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });

            if (refreshRequest == null || string.IsNullOrEmpty(refreshRequest.RefreshToken))
                return await ResponseHelper.CreateBadRequestResponse(req, "Refresh token is required");

            // Find user with this refresh token
            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => 
                u.RefreshToken == refreshRequest.RefreshToken && 
                u.RefreshTokenExpiry > DateTime.UtcNow);

            if (user == null)
                return await AuthorizationHelper.CreateUnauthorizedResponse(req, "Invalid or expired refresh token");

            // Generate new tokens
            var accessToken = _jwtTokenService.GenerateAccessToken(user);
            var newRefreshToken = _jwtTokenService.GenerateRefreshToken();
            
            // Update stored refresh token
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            user.LastLogin = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);
            
            _telemetry.TrackEvent("TokenRefreshed", new Dictionary<string, string>
            {
                { "UserId", user.Id },
                { "Email", user.Email }
            });

            return await ResponseHelper.CreateSuccessResponse(req, new
            {
                accessToken,
                refreshToken = newRefreshToken,
                expiresIn = 3600
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            _telemetry.TrackException(ex, new Dictionary<string, string>
            {
                { "Operation", "TokenRefresh" }
            });
            return await ResponseHelper.CreateErrorResponse(req, _logger, ex, "Error during token refresh");
        }
    }
}

public record LoginRequest(string Email, string? Name, string? Provider, string? ProfilePicture);
public record RefreshTokenRequest(string RefreshToken);
