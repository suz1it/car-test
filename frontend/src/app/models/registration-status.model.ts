export interface RegistrationStatus {
  carId: number;
  registrationNumber: string;
  make: string;
  model: string;
  registrationExpiryDate: string;
  isExpired: boolean;
}

/** Days threshold for "expiring soon" warning */
export const EXPIRING_SOON_DAYS = 30;

export type RegistrationStatusType = 'valid' | 'expiringSoon' | 'expired';
