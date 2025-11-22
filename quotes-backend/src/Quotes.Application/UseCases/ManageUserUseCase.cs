using Quotes.Application.DTOs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class ManageUserUseCase
{
    private readonly IUserRepository _userRepository;

    public ManageUserUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto> AssignRoleAsync(string userId, string role)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        var validRoles = new[] { "Anonymous", "Authenticated", "Contributor", "Admin" };
        if (!validRoles.Contains(role))
            throw new ArgumentException($"Invalid role. Must be one of: {string.Join(", ", validRoles)}");

        user.Role = role;
        await _userRepository.UpdateAsync(user);

        return MapToDto(user);
    }

    public async Task<UserDto> BanUserAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        user.IsActive = false;
        await _userRepository.UpdateAsync(user);

        return MapToDto(user);
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        await _userRepository.DeleteAsync(userId);
        return true;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            ProfilePicture = user.ProfilePicture,
            Provider = user.Provider,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            LastLogin = user.LastLogin,
            IsActive = user.IsActive
        };
    }
}
