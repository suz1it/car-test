using CarePlan.Api.Hubs;
using CarePlan.Api.Models;
using Microsoft.AspNetCore.SignalR;

namespace CarePlan.Api.Services;

public class RegistrationExpiryBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RegistrationExpiryBackgroundService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromSeconds(5);

    public RegistrationExpiryBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<RegistrationExpiryBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Registration expiry background service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = _serviceProvider.CreateAsyncScope();
                var carService = scope.ServiceProvider.GetRequiredService<ICarService>();
                var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<RegistrationHub>>();

                var statuses = await carService.GetRegistrationStatusesAsync(stoppingToken);

                await hubContext.Clients.All.SendAsync(
                    "RegistrationStatusUpdated",
                    statuses,
                    stoppingToken);

                _logger.LogDebug("Broadcast registration status to {Count} cars", statuses.Count());
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking registration expiry");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }

        _logger.LogInformation("Registration expiry background service stopped");
    }
}
