namespace CarePlan.Api.Models;

public class RegistrationStatus
{
    public int CarId { get; set; }
    public string RegistrationNumber { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public DateTime RegistrationExpiryDate { get; set; }
    public bool IsExpired { get; set; }
}
