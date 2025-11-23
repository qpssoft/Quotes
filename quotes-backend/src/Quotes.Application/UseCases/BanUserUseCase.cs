using Quotes.Application.DTOs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class BanUserUseCase
{
    private readonly IUserRepository _userRepository;

    public BanUserUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto> ExecuteAsync(string userId, bool banned)
    {
        // Get user
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        // Update active status
        user.IsActive = !banned;

        // Save
        var updated = await _userRepository.UpdateAsync(user);

        return MapToDto(updated);
    }

    private UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = user.Role,
            Provider = user.Provider,
            ProfilePicture = user.ProfilePicture,
            CreatedAt = user.CreatedAt,
            LastLogin = user.LastLogin,
            IsActive = user.IsActive
        };
    }
}
