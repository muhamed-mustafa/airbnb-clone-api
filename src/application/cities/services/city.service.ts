import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { CityEntity } from '../entities/city.entity';
import { CreateCityInput } from '../inputs/create-city.input';
import { UpdateCityInput } from '../inputs/update-city.input';
import { CityFilter } from '../repositories/city-filter';
import { CreateCityUseCase } from '../use-cases/create-city.usecase';
import { DeleteCityUseCase } from '../use-cases/delete-city.usecase';
import { FindAllCitiesUseCase } from '../use-cases/find-all-cities.usecase';
import { FindCityByIdUseCase } from '../use-cases/find-city-by-id.usecase';
import { UpdateCityUseCase } from '../use-cases/update-city.usecase';

@Injectable()
export class CityService {
  constructor(
    private readonly createCityUseCase: CreateCityUseCase,
    private readonly findCityByIdUseCase: FindCityByIdUseCase,
    private readonly findAllCitiesUseCase: FindAllCitiesUseCase,
    private readonly updateCityUseCase: UpdateCityUseCase,
    private readonly deleteCityUseCase: DeleteCityUseCase,
  ) {}

  async create(data: CreateCityInput): Promise<CityEntity> {
    return await this.createCityUseCase.execute(data);
  }

  async findAll(query: CityFilter = {}): Promise<PaginatedResult<CityEntity>> {
    return await this.findAllCitiesUseCase.execute(query);
  }

  async findById(id: string): Promise<CityEntity> {
    return await this.findCityByIdUseCase.execute(id);
  }

  async update(id: string, data: UpdateCityInput): Promise<CityEntity> {
    return await this.updateCityUseCase.execute(id, data);
  }

  async delete(id: string): Promise<void> {
    return await this.deleteCityUseCase.execute(id);
  }
}
