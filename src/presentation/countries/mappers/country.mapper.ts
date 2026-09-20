import type { CreateCountryInput } from '../../../application/countries/inputs/create-country.input';
import { CreateCountryOutput } from '../../../application/countries/outputs/create-country.output';
import { CountryResponseDto } from '../dtos/country-response.dto';
import { CreateCountryDto } from '../dtos/create-country.dto';

export class CountryMapper {
  static toCountryInput(country: CreateCountryDto): CreateCountryInput {
    return {
      name: country.name,
      code: country.code,
    };
  }

  static toResponse(country: CreateCountryOutput): CountryResponseDto {
    return {
      id: country.id,
      name: country.name,
      code: country.code,
    };
  }
}
