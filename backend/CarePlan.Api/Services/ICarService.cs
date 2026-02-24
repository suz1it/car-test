using CarePlan.Api.Models;

namespace CarePlan.Api.Services;

public interface ICarService
{
    Task<IEnumerable<Car>> GetCarsAsync(string? make = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<RegistrationStatus>> GetRegistrationStatusesAsync(CancellationToken cancellationToken = default);
}
