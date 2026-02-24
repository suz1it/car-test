using System.Text.Json;
using CarePlan.Api.Models;

namespace CarePlan.Api.Services;

public class CarService : ICarService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<CarService> _logger;
    private List<Car>? _cachedCars;

    public CarService(IWebHostEnvironment environment, ILogger<CarService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<PagedResult<Car>> GetCarsAsync(
        string? make = null,
        int page = 1,
        int pageSize = 10,
        string? sortColumn = null,
        string? sortDirection = "asc",
        CancellationToken cancellationToken = default)
    {
        var cars = await LoadCarsAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(make))
        {
            cars = cars.Where(c => c.Make.Equals(make, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        var sorted = ApplySort(cars, sortColumn ?? "make", sortDirection ?? "asc");
        var totalCount = sorted.Count;
        var items = sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedResult<Car>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    private static List<Car> ApplySort(List<Car> cars, string sortColumn, string sortDirection)
    {
        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        return sortColumn.ToLowerInvariant() switch
        {
            "id" => (isDesc ? cars.OrderByDescending(c => c.Id) : cars.OrderBy(c => c.Id)).ToList(),
            "make" => (isDesc ? cars.OrderByDescending(c => c.Make, StringComparer.OrdinalIgnoreCase) : cars.OrderBy(c => c.Make, StringComparer.OrdinalIgnoreCase)).ToList(),
            "model" => (isDesc ? cars.OrderByDescending(c => c.Model, StringComparer.OrdinalIgnoreCase) : cars.OrderBy(c => c.Model, StringComparer.OrdinalIgnoreCase)).ToList(),
            "registrationnumber" => (isDesc ? cars.OrderByDescending(c => c.RegistrationNumber, StringComparer.OrdinalIgnoreCase) : cars.OrderBy(c => c.RegistrationNumber, StringComparer.OrdinalIgnoreCase)).ToList(),
            "registrationexpirydate" => (isDesc ? cars.OrderByDescending(c => c.RegistrationExpiryDate) : cars.OrderBy(c => c.RegistrationExpiryDate)).ToList(),
            _ => cars.OrderBy(c => c.Make, StringComparer.OrdinalIgnoreCase).ToList()
        };
    }

    public async Task<IEnumerable<string>> GetMakesAsync(CancellationToken cancellationToken = default)
    {
        var cars = await LoadCarsAsync(cancellationToken);
        return cars
            .Select(c => c.Make)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(m => m, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private const int ExpiringSoonDays = 30;

    public async Task<IEnumerable<RegistrationStatus>> GetRegistrationStatusesAsync(CancellationToken cancellationToken = default)
    {
        var cars = await LoadCarsAsync(cancellationToken);
        var now = DateTime.UtcNow.Date;

        return cars.Select(c => new RegistrationStatus
        {
            CarId = c.Id,
            RegistrationNumber = c.RegistrationNumber,
            Make = c.Make,
            Model = c.Model,
            RegistrationExpiryDate = c.RegistrationExpiryDate,
            IsExpired = c.RegistrationExpiryDate.Date < now
        }).ToList();
    }

    public async Task<PagedResult<RegistrationStatus>> GetRegistrationStatusesPagedAsync(
        string? search = null,
        string? statusFilter = null,
        int page = 1,
        int pageSize = 10,
        string? sortColumn = null,
        string? sortDirection = "asc",
        CancellationToken cancellationToken = default)
    {
        var statuses = (await GetRegistrationStatusesAsync(cancellationToken)).ToList();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim();
            statuses = statuses.Where(s =>
                s.Make.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                s.Model.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                s.RegistrationNumber.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                s.CarId.ToString().Contains(q, StringComparison.Ordinal)).ToList();
        }

        if (!string.IsNullOrWhiteSpace(statusFilter) && !string.Equals(statusFilter, "all", StringComparison.OrdinalIgnoreCase))
        {
            var now = DateTime.UtcNow.Date;
            statuses = statusFilter.ToLowerInvariant() switch
            {
                "expired" => statuses.Where(s => s.IsExpired).ToList(),
                "expiringsoon" => statuses.Where(s =>
                {
                    if (s.IsExpired) return false;
                    var daysUntil = (s.RegistrationExpiryDate.Date - now).Days;
                    return daysUntil <= ExpiringSoonDays;
                }).ToList(),
                "valid" => statuses.Where(s =>
                {
                    if (s.IsExpired) return false;
                    var daysUntil = (s.RegistrationExpiryDate.Date - now).Days;
                    return daysUntil > ExpiringSoonDays;
                }).ToList(),
                _ => statuses
            };
        }

        var sorted = ApplyRegistrationStatusSort(statuses, sortColumn ?? "registrationExpiryDate", sortDirection ?? "asc");
        var totalCount = sorted.Count;
        var items = sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedResult<RegistrationStatus>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    private static List<RegistrationStatus> ApplyRegistrationStatusSort(
        List<RegistrationStatus> statuses,
        string sortColumn,
        string sortDirection)
    {
        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        var now = DateTime.UtcNow.Date;

        static int StatusOrder(RegistrationStatus s, DateTime today, int expiringSoonDays)
        {
            if (s.IsExpired) return 0;
            var daysUntil = (s.RegistrationExpiryDate.Date - today).Days;
            return daysUntil <= expiringSoonDays ? 1 : 2;
        }

        return sortColumn.ToLowerInvariant() switch
        {
            "registrationnumber" => (isDesc
                ? statuses.OrderByDescending(s => s.RegistrationNumber, StringComparer.OrdinalIgnoreCase)
                : statuses.OrderBy(s => s.RegistrationNumber, StringComparer.OrdinalIgnoreCase)).ToList(),
            "make" => (isDesc
                ? statuses.OrderByDescending(s => s.Make, StringComparer.OrdinalIgnoreCase)
                : statuses.OrderBy(s => s.Make, StringComparer.OrdinalIgnoreCase)).ToList(),
            "model" => (isDesc
                ? statuses.OrderByDescending(s => s.Model, StringComparer.OrdinalIgnoreCase)
                : statuses.OrderBy(s => s.Model, StringComparer.OrdinalIgnoreCase)).ToList(),
            "registrationexpirydate" => (isDesc
                ? statuses.OrderByDescending(s => s.RegistrationExpiryDate)
                : statuses.OrderBy(s => s.RegistrationExpiryDate)).ToList(),
            "status" => (isDesc
                ? statuses.OrderByDescending(s => StatusOrder(s, now, ExpiringSoonDays))
                : statuses.OrderBy(s => StatusOrder(s, now, ExpiringSoonDays))).ToList(),
            _ => statuses.OrderBy(s => s.RegistrationExpiryDate).ToList()
        };
    }

    private async Task<List<Car>> LoadCarsAsync(CancellationToken cancellationToken)
    {
        if (_cachedCars is not null)
            return _cachedCars;

        var dataPath = Path.Combine(_environment.ContentRootPath, "Data", "MockCarData.json");
        var json = await File.ReadAllTextAsync(dataPath, cancellationToken);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var cars = JsonSerializer.Deserialize<List<CarJsonDto>>(json, options)
            ?? throw new InvalidOperationException("Failed to load car data");

        _cachedCars = cars.Select(c => new Car
        {
            Id = c.Id,
            Make = c.Make,
            Model = c.Model,
            RegistrationNumber = c.RegistrationNumber,
            RegistrationExpiryDate = DateTime.Parse(c.RegistrationExpiryDate)
        }).ToList();

        return _cachedCars;
    }

    private sealed class CarJsonDto
    {
        public int Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string RegistrationNumber { get; set; } = string.Empty;
        public string RegistrationExpiryDate { get; set; } = string.Empty;
    }
}
