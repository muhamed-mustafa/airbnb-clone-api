export interface CheckAvailabilityOutput {
  available: boolean;
  daysCount: number;
  pricePerDay: number;
  bookingAmount: number;
  vat: number;
  vatAmount: number;
  totalAmount: number;
}
