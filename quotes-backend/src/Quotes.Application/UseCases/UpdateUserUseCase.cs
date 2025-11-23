using Quotes.Application.DTOs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class UpdateUserUseCase
{
    private readonly IUserRepository _userRepository;

    public UpdateUserUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto> ExecuteAsync(string userId, UpdateUserDto dto)
    {
        // Get existing user
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} not found");
        }

        // Update fields
        if (!string.IsNullOrWhiteSpace(dto.Name))
            user.Name = dto.Name;

        if (!string.IsNullOrWhiteSpace(dto.Role))
            user.Role = dto.Role;

        if (dto.IsActive.HasValue)
            user.IsActive = dto.IsActive.Value;

        if (!string.IsNullOrWhiteSpace(dto.ProfilePicture))
            user.ProfilePicture = dto.ProfilePicture;

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
