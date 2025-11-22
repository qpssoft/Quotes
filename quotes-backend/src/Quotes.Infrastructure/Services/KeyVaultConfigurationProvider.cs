using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

namespace Quotes.Infrastructure.Services;

public class KeyVaultConfigurationProvider
{
    private readonly SecretClient _secretClient;

    public KeyVaultConfigurationProvider(string keyVaultUri)
    {
        var credential = new DefaultAzureCredential();
        _secretClient = new SecretClient(new Uri(keyVaultUri), credential);
    }

    public async Task<string> GetSecretAsync(string secretName)
    {
        try
        {
            var secret = await _secretClient.GetSecretAsync(secretName);
            return secret.Value.Value;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to retrieve secret '{secretName}' from Key Vault", ex);
        }
    }

    public async Task<Dictionary<string, string>> GetAllSecretsAsync()
    {
        var secrets = new Dictionary<string, string>();
        await foreach (var secretProperties in _secretClient.GetPropertiesOfSecretsAsync())
        {
            var secret = await _secretClient.GetSecretAsync(secretProperties.Name);
            secrets[secretProperties.Name] = secret.Value.Value;
        }
        return secrets;
    }
}
