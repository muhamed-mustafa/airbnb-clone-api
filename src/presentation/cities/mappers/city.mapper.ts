import type { CreateCityInput } from '@application/cities/inputs/create-city.input';
import type { UpdateCityInput } from '@application/cities/inputs/update-city.input';
import type { CityOutput } from '@application/cities/outputs/city.output';
import { CityResponseDto } from '../dtos/city-response.dto';
import { CreateCityDto } from '../dtos/create-city.dto';
import { UpdateCityDto } from '../dtos/update-city.dto';

export class CityMapper {
  static toCreateCityInput(city: CreateCityDto): CreateCityInput {
    return {
      name: city.name,
      country: city.country,
    };
  }

  static toUpdateCityInput(city: UpdateCityDto): UpdateCityInput {
    return {
      name: city.name,
      country: city.country,
    };
  }

  static toResponse(city: CityOutput): CityResponseDto {
    return {
      id: city.id,
      name: city.name,
      country: city.country,
    };
  }
}
