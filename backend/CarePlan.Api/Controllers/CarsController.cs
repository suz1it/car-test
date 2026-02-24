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
    /// Gets a paginated list of cars with optional filter by make and sorting.
    /// </summary>
    /// <param name="make">Optional. Filter cars by manufacturer (e.g., Toyota, Honda).</param>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Number of items per page.</param>
    /// <param name="sortColumn">Sort column: id, make, model, registrationNumber, registrationExpiryDate.</param>
    /// <param name="sortDirection">Sort direction: asc or desc.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<Car>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<Car>>> GetCars(
        [FromQuery] string? make,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortColumn = "make",
        [FromQuery] string? sortDirection = "asc",
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var result = await _carService.GetCarsAsync(make, page, pageSize, sortColumn, sortDirection, cancellationToken);
        return Ok(result);
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
    /// Gets a paginated list of registration statuses with optional search, status filter, and sorting.
    /// </summary>
    /// <param name="search">Optional. Search in make, model, registration number, car ID.</param>
    /// <param name="statusFilter">Optional. Filter by status: all, valid, expiringSoon, expired.</param>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Number of items per page.</param>
    /// <param name="sortColumn">Sort column: registrationNumber, make, model, registrationExpiryDate, status.</param>
    /// <param name="sortDirection">Sort direction: asc or desc.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("registration-status")]
    [ProducesResponseType(typeof(PagedResult<RegistrationStatus>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<RegistrationStatus>>> GetRegistrationStatus(
        [FromQuery] string? search,
        [FromQuery] string? statusFilter = "all",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortColumn = "registrationExpiryDate",
        [FromQuery] string? sortDirection = "asc",
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var result = await _carService.GetRegistrationStatusesPagedAsync(
            search, statusFilter, page, pageSize, sortColumn, sortDirection, cancellationToken);
        return Ok(result);
    }
}
