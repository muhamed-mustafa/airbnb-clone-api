export interface UnitEntity {
  id: string;
  user: string;
  title: string;
  description: string;
  address: string;
  photos: string[];
  costPerDay: number;
  country: string;
  city: string;
  unitCategory: string;
  roomsCount: number;
  adultsCount: number;
  kidsCount: number;
  hasInternetService: boolean;
  hasKitchen: boolean;
  hasPrivateGarage: boolean;
  availability: boolean;
}
