using System.Text.Json;
using Azure.Storage.Blobs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Infrastructure.Repositories;

public class BlobUserRepository : IUserRepository
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName = "users";
    private readonly string _usersFile = "users.json";

    public BlobUserRepository(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }

    private async Task<List<User>> ReadUsersAsync()
    {
        var container = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = container.GetBlobClient(_usersFile);

        if (!await blobClient.ExistsAsync())
            return new List<User>();

        var response = await blobClient.DownloadAsync();
        var users = await JsonSerializer.DeserializeAsync<List<User>>(response.Value.Content);
        return users ?? new List<User>();
    }

    private async Task WriteUsersAsync(List<User> users)
    {
        var container = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = container.GetBlobClient(_usersFile);

        var json = JsonSerializer.Serialize(users, new JsonSerializerOptions { WriteIndented = true });
        using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(json));
        await blobClient.UploadAsync(stream, overwrite: true);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await ReadUsersAsync();
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        var users = await ReadUsersAsync();
        return users.FirstOrDefault(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var users = await ReadUsersAsync();
        return users.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<User> AddAsync(User user)
    {
        var users = await ReadUsersAsync();
        
        user.Id = Guid.NewGuid().ToString();
        user.CreatedAt = DateTime.UtcNow;
        users.Add(user);

        await WriteUsersAsync(users);
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        var users = await ReadUsersAsync();
        var index = users.FindIndex(u => u.Id == user.Id);
        
        if (index == -1)
            throw new InvalidOperationException($"User with ID {user.Id} not found");

        users[index] = user;
        await WriteUsersAsync(users);
        
        return user;
    }

    public async Task DeleteAsync(string id)
    {
        var users = await ReadUsersAsync();
        var initialCount = users.Count;
        users.RemoveAll(u => u.Id == id);

        if (users.Count == initialCount)
            throw new InvalidOperationException($"User with ID {id} not found");

        await WriteUsersAsync(users);
    }
}
