import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination/pagination.types';
import { CurrencyEntity } from '../entities/currency.entity';
import { CreateCurrencyInput } from '../inputs/create-currency.input';
import { UpdateCurrencyInput } from '../inputs/update-currency.input';
import { CurrencyFilter } from '../repositories/currency-filter';
import { CreateCurrencyUseCase } from '../use-cases/create-currency.usecase';
import { DeleteCurrencyUseCase } from '../use-cases/delete-currency.usecase';
import { FindAllCurrenciesUseCase } from '../use-cases/find-all-currencies.usecase';
import { FindCurrencyByIdUseCase } from '../use-cases/find-currency-by-id.usecase';
import { UpdateCurrencyUseCase } from '../use-cases/update-currency.usecase';

@Injectable()
export class CurrencyService {
  constructor(
    private readonly createCurrencyUseCase: CreateCurrencyUseCase,
    private readonly findCurrencyByIdUseCase: FindCurrencyByIdUseCase,
    private readonly findAllCurrenciesUseCase: FindAllCurrenciesUseCase,
    private readonly updateCurrencyUseCase: UpdateCurrencyUseCase,
    private readonly deleteCurrencyUseCase: DeleteCurrencyUseCase,
  ) {}

  async create(data: CreateCurrencyInput): Promise<CurrencyEntity> {
    return await this.createCurrencyUseCase.execute(data);
  }

  async findAll(query: CurrencyFilter = {}): Promise<PaginatedResult<CurrencyEntity>> {
    return await this.findAllCurrenciesUseCase.execute(query);
  }

  async findById(id: string): Promise<CurrencyEntity> {
    return await this.findCurrencyByIdUseCase.execute(id);
  }

  async update(id: string, data: UpdateCurrencyInput): Promise<CurrencyEntity> {
    return await this.updateCurrencyUseCase.execute(id, data);
  }

  async delete(id: string): Promise<void> {
    return await this.deleteCurrencyUseCase.execute(id);
  }
}
