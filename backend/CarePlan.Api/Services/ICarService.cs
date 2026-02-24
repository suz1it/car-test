using CarePlan.Api.Models;

namespace CarePlan.Api.Services;

public interface ICarService
{
    Task<PagedResult<Car>> GetCarsAsync(
        string? make = null,
        int page = 1,
        int pageSize = 10,
        string? sortColumn = null,
        string? sortDirection = "asc",
        CancellationToken cancellationToken = default);
    Task<IEnumerable<RegistrationStatus>> GetRegistrationStatusesAsync(CancellationToken cancellationToken = default);

    Task<PagedResult<RegistrationStatus>> GetRegistrationStatusesPagedAsync(
        string? search = null,
        string? statusFilter = null,
        int page = 1,
        int pageSize = 10,
        string? sortColumn = null,
        string? sortDirection = "asc",
        CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetMakesAsync(CancellationToken cancellationToken = default);
}
