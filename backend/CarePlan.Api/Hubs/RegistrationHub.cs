using CarePlan.Api.Models;
using CarePlan.Api.Services;
using Microsoft.AspNetCore.SignalR;

namespace CarePlan.Api.Hubs;

public class RegistrationHub : Hub
{
    private readonly ICarService _carService;

    public RegistrationHub(ICarService carService)
    {
        _carService = carService;
    }

    public override async Task OnConnectedAsync()
    {
        var statuses = await _carService.GetRegistrationStatusesAsync();
        await Clients.Caller.SendAsync("RegistrationStatusUpdated", statuses);
        await base.OnConnectedAsync();
    }
}
