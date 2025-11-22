using System.Text.Json;
using Azure.Storage.Blobs;
using Quotes.Core.Entities;
using Quotes.Core.Interfaces;

namespace Quotes.Infrastructure.Repositories;

public class BlobQuoteRepository : IQuoteRepository
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName = "quotes";
    private readonly string _publicFileVi = "data_vi.json";
    private readonly string _publicFileEn = "data_en.json";

    public BlobQuoteRepository(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }

    public async Task<IEnumerable<Quote>> GetAllAsync(string? category = null, string? language = null, string? author = null)
    {
        var container = _blobServiceClient.GetBlobContainerClient(_containerName);
        
        var quotes = new List<Quote>();

        // Determine which files to read
        var filesToRead = new List<string>();
        if (string.IsNullOrEmpty(language) || language == "vi")
            filesToRead.Add(_publicFileVi);
        if (string.IsNullOrEmpty(language) || language == "en")
            filesToRead.Add(_publicFileEn);

        foreach (var file in filesToRead)
        {
            var blobClient = container.GetBlobClient(file);
            if (await blobClient.ExistsAsync())
            {
                var response = await blobClient.DownloadAsync();
                var fileQuotes = await JsonSerializer.DeserializeAsync<List<Quote>>(response.Value.Content);
                if (fileQuotes != null)
                    quotes.AddRange(fileQuotes);
            }
        }

        // Apply filters
        var filtered = quotes.AsQueryable();
        if (!string.IsNullOrEmpty(category))
            filtered = filtered.Where(q => q.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrEmpty(language))
            filtered = filtered.Where(q => q.Language.Equals(language, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrEmpty(author))
            filtered = filtered.Where(q => q.Author.Contains(author, StringComparison.OrdinalIgnoreCase));

        return filtered.ToList();
    }

    public async Task<Quote?> GetByIdAsync(string id)
    {
        var allQuotes = await GetAllAsync();
        return allQuotes.FirstOrDefault(q => q.Id == id);
    }

    public async Task<Quote> AddAsync(Quote quote)
    {
        var container = _blobServiceClient.GetBlobContainerClient(_containerName);
        
        // Determine file name based on language
        var fileName = quote.Language == "vi" ? _publicFileVi : _publicFileEn;
        var blobClient = container.GetBlobClient(fileName);

        // Read existing quotes
        var quotes = new List<Quote>();
        if (await blobClient.ExistsAsync())
        {
            var response = await blobClient.DownloadAsync();
            var existingQuotes = await JsonSerializer.DeserializeAsync<List<Quote>>(response.Value.Content);
            if (existingQuotes != null)
                quotes = existingQuotes;
        }

        // Add new quote
        quote.Id = Guid.NewGuid().ToString();
        quote.CreatedAt = DateTime.UtcNow;
        quotes.Add(quote);

        // Write back
        var json = JsonSerializer.Serialize(quotes, new JsonSerializerOptions { WriteIndented = true });
        using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(json));
        await blobClient.UploadAsync(stream, overwrite: true);

        return quote;
    }

    public async Task<Quote> UpdateAsync(Quote quote)
    {
        var container = _blobServiceClient.GetBlobContainerClient(_containerName);
        var fileName = quote.Language == "vi" ? _publicFileVi : _publicFileEn;
        var blobClient = container.GetBlobClient(fileName);

        // Read existing quotes
        var response = await blobClient.DownloadAsync();
        var quotes = await JsonSerializer.DeserializeAsync<List<Quote>>(response.Value.Content);
        if (quotes == null)
            throw new InvalidOperationException("Quotes file not found");

        // Update quote
        var index = quotes.FindIndex(q => q.Id == quote.Id);
        if (index == -1)
            throw new InvalidOperationException($"Quote with ID {quote.Id} not found");

        quotes[index] = quote;

        // Write back
        var json = JsonSerializer.Serialize(quotes, new JsonSerializerOptions { WriteIndented = true });
        using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(json));
        await blobClient.UploadAsync(stream, overwrite: true);

        return quote;
    }

    public async Task DeleteAsync(string id)
    {
        var container = _blobServiceClient.GetBlobContainerClient(_containerName);

        // Try both files
        foreach (var fileName in new[] { _publicFileVi, _publicFileEn })
        {
            var blobClient = container.GetBlobClient(fileName);
            if (!await blobClient.ExistsAsync())
                continue;

            var response = await blobClient.DownloadAsync();
            var quotes = await JsonSerializer.DeserializeAsync<List<Quote>>(response.Value.Content);
            if (quotes == null)
                continue;

            var initialCount = quotes.Count;
            quotes.RemoveAll(q => q.Id == id);

            if (quotes.Count < initialCount)
            {
                // Write back
                var json = JsonSerializer.Serialize(quotes, new JsonSerializerOptions { WriteIndented = true });
                using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(json));
                await blobClient.UploadAsync(stream, overwrite: true);
                return;
            }
        }

        throw new InvalidOperationException($"Quote with ID {id} not found");
    }

    public async Task<int> CountAsync(string? category = null, string? language = null)
    {
        var quotes = await GetAllAsync(category, language);
        return quotes.Count();
    }
}
