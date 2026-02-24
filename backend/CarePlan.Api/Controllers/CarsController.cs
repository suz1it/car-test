using CarePlan.Api.Models;
using CarePlan.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CarePlan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarsController : ControllerBase
{
    private readonly ICarService _carService;

    public CarsController(ICarService carService)
    {
        _carService = carService;
    }

    /// <summary>
    /// Gets a list of cars with optional filter by make.
    /// </summary>
    /// <param name="make">Optional. Filter cars by manufacturer (e.g., Toyota, Honda).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Car>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Car>>> GetCars(
        [FromQuery] string? make,
        CancellationToken cancellationToken)
    {
        var cars = await _carService.GetCarsAsync(make, cancellationToken);
        return Ok(cars);
    }

    /// <summary>
    /// Gets the list of unique car makes for dropdown selection.
    /// </summary>
    [HttpGet("makes")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<string>>> GetMakes(CancellationToken cancellationToken)
    {
        var makes = await _carService.GetMakesAsync(cancellationToken);
        return Ok(makes);
    }

    /// <summary>
    /// Gets current registration status for all cars.
    /// </summary>
    [HttpGet("registration-status")]
    [ProducesResponseType(typeof(IEnumerable<RegistrationStatus>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RegistrationStatus>>> GetRegistrationStatus(
        CancellationToken cancellationToken)
    {
        var statuses = await _carService.GetRegistrationStatusesAsync(cancellationToken);
        return Ok(statuses);
    }
}
