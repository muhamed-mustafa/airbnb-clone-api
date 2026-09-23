import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination/pagination.types';
import { CountryEntity } from '../entities/country.entity';
import { CreateCountryInput } from '../inputs/create-country.input';
import { UpdateCountryInput } from '../inputs/update-country.input';
import { CountryFilter } from '../repositories/country-filter';
import { CreateCountryUseCase } from '../use-cases/create-country.usecase';
import { DeleteCountryUseCase } from '../use-cases/delete-country.usecase';
import { FindAllCountriesUseCase } from '../use-cases/find-all-countries.usecase';
import { FindCountryByIdUseCase } from '../use-cases/find-country-by-id.usecase';
import { UpdateCountryUseCase } from '../use-cases/update-country.usecase';

@Injectable()
export class CountryService {
  constructor(
    private readonly createCountryUseCase: CreateCountryUseCase,
    private readonly findCountryByIdUseCase: FindCountryByIdUseCase,
    private readonly findAllCountriesUseCase: FindAllCountriesUseCase,
    private readonly updateCountryUseCase: UpdateCountryUseCase,
    private readonly deleteCountryUseCase: DeleteCountryUseCase,
  ) {}

  async create(data: CreateCountryInput): Promise<CountryEntity> {
    return await this.createCountryUseCase.execute(data);
  }

  async findAll(query: CountryFilter = {}): Promise<PaginatedResult<CountryEntity>> {
    return await this.findAllCountriesUseCase.execute(query);
  }

  async findById(id: string): Promise<CountryEntity> {
    return await this.findCountryByIdUseCase.execute(id);
  }

  async update(id: string, data: UpdateCountryInput): Promise<CountryEntity> {
    return await this.updateCountryUseCase.execute(id, data);
  }

  async delete(id: string): Promise<void> {
    return await this.deleteCountryUseCase.execute(id);
  }
}
