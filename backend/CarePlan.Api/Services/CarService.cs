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

    public async Task<IEnumerable<Car>> GetCarsAsync(string? make = null, CancellationToken cancellationToken = default)
    {
        var cars = await LoadCarsAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(make))
        {
            cars = cars.Where(c => c.Make.Equals(make, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return cars;
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
