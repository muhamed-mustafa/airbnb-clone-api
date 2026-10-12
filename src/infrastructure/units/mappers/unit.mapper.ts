import { UnitEntity } from '@application/units/entities/unit-entity';
import { Unit } from '@infrastructure/units/schemas/units.schema';
import type { HydratedDocument } from 'mongoose';

export class UnitMapper {
  static toEntity(unit: HydratedDocument<Unit>): UnitEntity {
    return {
      id: unit._id.toString(),
      user: unit.user.toString(),
      title: unit.title,
      description: unit.description,
      address: unit.address,
      photos: unit.photos,
      costPerDay: unit.costPerDay,
      country: unit.country.toString(),
      city: unit.city.toString(),
      unitCategory: unit.unitCategory.toString(),
      roomsCount: unit.roomsCount,
      adultsCount: unit.adultsCount,
      kidsCount: unit.kidsCount,
      hasInternetService: unit.hasInternetService,
      hasKitchen: unit.hasKitchen,
      hasPrivateGarage: unit.hasPrivateGarage,
      availability: unit.availability,
    };
  }
}
