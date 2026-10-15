import { AppSettingsService } from '@application/app-settings/services/app-settings.service';
import { CityService } from '@application/cities/services/city.service';
import { CountryService } from '@application/countries/services/country.service';
import { UnitCategoryService } from '@application/unit-categories/services/unit-category.service';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UnitValidationUseCase {
  constructor(
    private readonly appSettingsService: AppSettingsService,
    private readonly unitCategoriesService: UnitCategoryService,
    private readonly countriesService: CountryService,
    private readonly citiesService: CityService,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  async execute(data: CreateUnitInput | UpdateUnitInput, currentCountry?: string): Promise<void> {
    const checks: Promise<void>[] = [];

    if (data.costPerDay !== undefined) {
      const costPerDay = Number(data.costPerDay);

      checks.push(
        (async () => {
          const settings = await this.appSettingsService.findOne();

          if (costPerDay < settings.minPrice) {
            this.logger.warn('Unit validation rejected', {
              code: 'UNIT_COST_PER_DAY_TOO_LOW_MIN_PRICE',
            });
            throw new ApplicationError('UNIT_COST_PER_DAY_TOO_LOW_MIN_PRICE');
          }
        })(),
      );
    }

    if (data.unitCategory !== undefined) {
      checks.push(
        (async () => {
          const category = await this.unitCategoriesService.findById(data.unitCategory!);

          if (!category) {
            this.logger.warn('Unit validation rejected', { code: 'UNIT_CATEGORY_NOT_FOUND' });
            throw new ApplicationError('UNIT_CATEGORY_NOT_FOUND');
          }
        })(),
      );
    }

    if (data.country !== undefined) {
      checks.push(
        (async () => {
          const country = await this.countriesService.findById(data.country!);

          if (!country) {
            this.logger.warn('Unit validation rejected', { code: 'COUNTRY_NOT_FOUND' });
            throw new ApplicationError('COUNTRY_NOT_FOUND');
          }
        })(),
      );
    }

    if (data.city !== undefined) {
      checks.push(
        (async () => {
          const city = await this.citiesService.findById(data.city!);

          const countryId = data.country ?? currentCountry;

          if (countryId && city.country !== countryId) {
            this.logger.warn('Unit validation rejected', {
              code: 'CITY_COUNTRY_MISMATCH',
              cityId: data.city,
              countryId,
            });

            throw new ApplicationError('CITY_COUNTRY_MISMATCH');
          }
        })(),
      );
    }

    await Promise.all(checks);
    this.logger.debug('Unit validation completed', { checksCount: checks.length });
  }
}
