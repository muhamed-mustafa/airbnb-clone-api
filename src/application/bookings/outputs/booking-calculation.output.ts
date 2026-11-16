export interface BookingCalculationResponse {
  pricePerDay: number;
  daysCount: number;
  bookingAmount: number;
  vat: number;
  vatAmount: number;
  totalAmount: number;
}
