using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;

namespace Quotes.Functions.Functions;

public class TestFunction
{
    private readonly ILogger<TestFunction> _logger;

    public TestFunction(ILogger<TestFunction> logger)
    {
        _logger = logger;
    }

    [Function("Test")]
    public HttpResponseData Test(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "test")] HttpRequestData req)
    {
        _logger.LogInformation("Test function called");

        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
        response.WriteString("Hello from Azure Functions! Deployment successful!");

        return response;
    }

    [Function("Ping")]
    public HttpResponseData Ping(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "ping")] HttpRequestData req)
    {
        _logger.LogInformation("Ping function called");

        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "application/json");
        response.WriteString("{\"status\":\"alive\",\"message\":\"pong\"}");

        return response;
    }
}
