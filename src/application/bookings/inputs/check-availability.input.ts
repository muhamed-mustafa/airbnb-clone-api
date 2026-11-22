export type CheckAvailabilityInput = {
  unit: string;
  checkIn: Date;
  checkOut: Date;
  adultsCount?: number;
  kidsCount?: number;
};
