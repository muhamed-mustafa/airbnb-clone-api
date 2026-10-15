import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import { CreateUnitDto } from '@presentation/units/dtos/create-unit.dto';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { UpdateUnitDto } from '@presentation/units/dtos/update-unit.dto';

export class UnitMapper {
  static toCreateUnitInput(unit: CreateUnitDto): Omit<CreateUnitInput, 'user'> {
    return {
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

  static toUpdateUnitInput(unit: UpdateUnitDto): UpdateUnitInput {
    return {
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
      isActive: unit.isActive,
      user: unit.user,
    };
  }
}
