using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using System.Net;

namespace Quotes.Functions.Middleware;

public class CorsMiddleware : IFunctionsWorkerMiddleware
{
    private readonly string[] _allowedOrigins = new[]
    {
        "http://localhost:3000",    // React Admin Center (dev)
        "http://localhost:4200",    // Angular Platform (dev)
        "http://localhost:5173",    // Vite (dev)
        "https://*.github.io",      // GitHub Pages
        "capacitor://localhost",    // Capacitor (mobile)
        "ionic://localhost"         // Ionic (mobile)
    };

    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        var requestData = await context.GetHttpRequestDataAsync();
        
        if (requestData != null)
        {
            var origin = requestData.Headers.TryGetValues("Origin", out var origins) 
                ? origins.FirstOrDefault() 
                : null;

            // Handle OPTIONS preflight requests immediately
            if (requestData.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                var response = requestData.CreateResponse(HttpStatusCode.NoContent);
                
                // Add CORS headers
                if (origin != null && IsOriginAllowed(origin))
                {
                    response.Headers.Add("Access-Control-Allow-Origin", origin);
                    response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                    response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
                    response.Headers.Add("Access-Control-Allow-Credentials", "true");
                    response.Headers.Add("Access-Control-Max-Age", "86400");
                }
                
                context.GetInvocationResult().Value = response;
                return;
            }
        }

        // Continue with the function execution for non-OPTIONS requests
        await next(context);

        // Add CORS headers to the actual response
        var httpResponseData = context.GetHttpResponseData();
        if (httpResponseData != null && requestData != null)
        {
            AddCorsHeaders(httpResponseData, requestData);
        }
    }

    private bool IsOriginAllowed(string origin)
    {
        // For development, allow all localhost origins
        if (origin.StartsWith("http://localhost", StringComparison.OrdinalIgnoreCase) || 
            origin.StartsWith("https://localhost", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // Check against allowed origins list
        return _allowedOrigins.Any(allowed => 
            allowed.Contains("*") 
                ? origin.Contains(allowed.Replace("*.", "")) 
                : origin.Equals(allowed, StringComparison.OrdinalIgnoreCase));
    }

    private void AddCorsHeaders(HttpResponseData response, HttpRequestData request)
    {
        var origin = request.Headers.TryGetValues("Origin", out var origins) 
            ? origins.FirstOrDefault() 
            : null;

        if (origin != null && IsOriginAllowed(origin))
        {
            response.Headers.Add("Access-Control-Allow-Origin", origin);
            response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            response.Headers.Add("Access-Control-Allow-Credentials", "true");
        }
    }
}
