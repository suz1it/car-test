export interface RegistrationStatus {
  carId: number;
  registrationNumber: string;
  make: string;
  model: string;
  registrationExpiryDate: string;
  isExpired: boolean;
}
