using Quotes.Application.DTOs;
using Quotes.Core.Entities;

namespace Quotes.Application.Common;

/// <summary>
/// Centralized mapper for User entity to DTO conversions
/// </summary>
public static class UserMapper
{
    /// <summary>
    /// Maps a User entity to a UserDto
    /// </summary>
    public static UserDto ToDto(User user)
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

    /// <summary>
    /// Maps a collection of User entities to UserDtos
    /// </summary>
    public static IEnumerable<UserDto> ToDtos(IEnumerable<User> users)
    {
        return users.Select(ToDto);
    }
}
