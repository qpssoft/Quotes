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
            // Handle OPTIONS preflight requests
            if (requestData.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                var response = requestData.CreateResponse(HttpStatusCode.OK);
                AddCorsHeaders(response, requestData);
                context.GetInvocationResult().Value = response;
                return;
            }
        }

        // Continue with the function execution
        await next(context);

        // Add CORS headers to the response
        var httpResponseData = context.GetHttpResponseData();
        if (httpResponseData != null && requestData != null)
        {
            AddCorsHeaders(httpResponseData, requestData);
        }
    }

    private void AddCorsHeaders(HttpResponseData response, HttpRequestData request)
    {
        var origin = request.Headers.TryGetValues("Origin", out var origins) 
            ? origins.FirstOrDefault() 
            : null;

        // For development, allow all localhost origins
        if (origin != null && (origin.StartsWith("http://localhost") || origin.StartsWith("https://localhost")))
        {
            response.Headers.Add("Access-Control-Allow-Origin", origin);
        }
        else if (origin != null && _allowedOrigins.Any(allowed => origin.Contains(allowed.Replace("*.", ""))))
        {
            response.Headers.Add("Access-Control-Allow-Origin", origin);
        }

        response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        response.Headers.Add("Access-Control-Allow-Credentials", "true");
        response.Headers.Add("Access-Control-Max-Age", "3600");
    }
}
