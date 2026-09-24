import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination/pagination.types';
import { UnitCategoryEntity } from '../entities/unit-category.entity';
import { CreateUnitCategoryInput } from '../inputs/create-unit-category.input';
import { UpdateUnitCategoryInput } from '../inputs/update-unit-category.input';
import { UnitCategoryFilter } from '../repositories/unit-category-filter';
import { CreateUnitCategoryUseCase } from '../use-cases/create-unit-category.usecase';
import { DeleteUnitCategoryUseCase } from '../use-cases/delete-unit-category.usecase';
import { FindAllUnitCategoriesUseCase } from '../use-cases/find-all-unit-categories.usecase';
import { FindUnitCategoryByIdUseCase } from '../use-cases/find-unit-category-by-id.usecase';
import { UpdateUnitCategoryUseCase } from '../use-cases/update-unit-category.usecase';

@Injectable()
export class UnitCategoryService {
  constructor(
    private readonly createUnitCategoryUseCase: CreateUnitCategoryUseCase,
    private readonly findUnitCategoryByIdUseCase: FindUnitCategoryByIdUseCase,
    private readonly findAllUnitCategoriesUseCase: FindAllUnitCategoriesUseCase,
    private readonly updateUnitCategoryUseCase: UpdateUnitCategoryUseCase,
    private readonly deleteUnitCategoryUseCase: DeleteUnitCategoryUseCase,
  ) {}

  async create(data: CreateUnitCategoryInput): Promise<UnitCategoryEntity> {
    return await this.createUnitCategoryUseCase.execute(data);
  }

  async findAll(query: UnitCategoryFilter = {}): Promise<PaginatedResult<UnitCategoryEntity>> {
    return await this.findAllUnitCategoriesUseCase.execute(query);
  }

  async findById(id: string): Promise<UnitCategoryEntity> {
    return await this.findUnitCategoryByIdUseCase.execute(id);
  }

  async update(id: string, data: UpdateUnitCategoryInput): Promise<UnitCategoryEntity> {
    return await this.updateUnitCategoryUseCase.execute(id, data);
  }

  async delete(id: string): Promise<void> {
    return await this.deleteUnitCategoryUseCase.execute(id);
  }
}
