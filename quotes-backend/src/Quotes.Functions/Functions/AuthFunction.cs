using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;
using Quotes.Infrastructure.Auth;
using Quotes.Functions.Middleware;
using Quotes.Infrastructure.Services;

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
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new { error = "Email is required" });
                return badRequest;
            }

            // For MVP: Create or get user (simplified - no actual OAuth provider integration yet)
            var user = await _userRepository.GetByEmailAsync(loginRequest.Email);
            
            if (user == null)
            {
                // Create new user
                user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = loginRequest.Email,
                    Name = loginRequest.Name ?? loginRequest.Email.Split('@')[0],
                    Provider = loginRequest.Provider ?? "email",
                    Role = "Authenticated",
                    CreatedAt = DateTime.UtcNow,
                    LastLogin = DateTime.UtcNow,
                    IsActive = true
                };

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

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
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

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            _telemetry.TrackException(ex, new Dictionary<string, string>
            {
                { "Operation", "Login" },
                { "Email", loginRequest?.Email ?? "unknown" }
            });
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }

    [Function("GetCurrentUser")]
    public async Task<HttpResponseData> GetCurrentUser(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "v1/users/me")] HttpRequestData req,
        FunctionContext context)
    {
        if (!context.IsAuthenticated())
        {
            return req.CreateUnauthorizedResponse();
        }

        var userId = context.GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return req.CreateUnauthorizedResponse();
        }

        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                var notFound = req.CreateResponse(HttpStatusCode.NotFound);
                await notFound.WriteAsJsonAsync(new { error = "User not found" });
                return notFound;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
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

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }

    [Function("Logout")]
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
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }
    
    [Function("RefreshToken")]
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
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new { error = "Refresh token is required" });
                return badRequest;
            }

            // Find user with this refresh token
            var users = await _userRepository.GetAllAsync();
            var user = users.FirstOrDefault(u => 
                u.RefreshToken == refreshRequest.RefreshToken && 
                u.RefreshTokenExpiry > DateTime.UtcNow);

            if (user == null)
            {
                var unauthorized = req.CreateResponse(HttpStatusCode.Unauthorized);
                await unauthorized.WriteAsJsonAsync(new { error = "Invalid or expired refresh token" });
                return unauthorized;
            }

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

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new
            {
                accessToken,
                refreshToken = newRefreshToken,
                expiresIn = 3600
            });

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            _telemetry.TrackException(ex, new Dictionary<string, string>
            {
                { "Operation", "TokenRefresh" }
            });
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            return errorResponse;
        }
    }
}

public record LoginRequest(string Email, string? Name, string? Provider, string? ProfilePicture);
public record RefreshTokenRequest(string RefreshToken);
