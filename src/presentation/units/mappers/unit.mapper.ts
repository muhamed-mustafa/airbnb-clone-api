import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { CreateUnitDto } from '@presentation/units/dtos/create-unit.dto';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';

export class UnitMapper {
  static toCreateUnitInput(unit: CreateUnitDto): CreateUnitInput {
    return {
      user: unit?.user,
      title: unit.title,
      description: unit.description,
      address: unit.address,
      photos: unit.photos,
      costPerDay: unit.costPerDay,
      country: unit.country,
      city: unit.city,
      unitCategory: unit.unitCategory,
      roomsCount: unit.roomsCount,
      adultsCount: unit.adultsCount,
      kidsCount: unit.kidsCount,
      hasInternetService: unit.hasInternetService,
      hasKitchen: unit.hasKitchen,
      hasPrivateGarage: unit.hasPrivateGarage,
      availability: unit.availability,
    };
  }

  static toResponse(unit: UnitEntity): UnitResponseDto {
    return {
      id: unit.id,
      title: unit.title,
      description: unit.description,
      address: unit.address,
      photos: unit.photos,
      costPerDay: unit.costPerDay,
      country: unit.country,
      city: unit.city,
      unitCategory: unit.unitCategory,
      roomsCount: unit.roomsCount,
      adultsCount: unit.adultsCount,
      kidsCount: unit.kidsCount,
      hasInternetService: unit.hasInternetService,
      hasKitchen: unit.hasKitchen,
      hasPrivateGarage: unit.hasPrivateGarage,
      availability: unit.availability,
      user: unit.user,
    };
  }
}
