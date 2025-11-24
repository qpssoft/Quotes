using Quotes.Application.Common;
using Quotes.Application.DTOs;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class GetUserByIdUseCase
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> ExecuteAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user == null ? null : UserMapper.ToDto(user);
    }
}
