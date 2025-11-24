using Quotes.Application.Common;
using Quotes.Application.DTOs;
using Quotes.Core.Interfaces;

namespace Quotes.Application.UseCases;

public class GetAllUsersUseCase
{
    private readonly IUserRepository _userRepository;

    public GetAllUsersUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> ExecuteAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return UserMapper.ToDtos(users);
    }
}
