import { AppSettingsService } from '@application/app-settings/services/app-settings.service';
import { CityService } from '@application/cities/services/city.service';
import { CountryService } from '@application/countries/services/country.service';
import { UnitCategoryService } from '@application/unit-categories/services/unit-category.service';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import { ApplicationError } from '@common/errors/application.error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitValidationUseCase {
  constructor(
    private readonly appSettingsService: AppSettingsService,
    private readonly unitCategoriesService: UnitCategoryService,
    private readonly countriesService: CountryService,
    private readonly citiesService: CityService,
  ) {}

  async execute(data: CreateUnitInput | UpdateUnitInput): Promise<void> {
    const checks: Promise<void>[] = [];

    if (data.costPerDay !== undefined) {
      checks.push(
        (async () => {
          const settings = await this.appSettingsService.findOne();

          if (data.costPerDay! < settings.minPrice) {
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
            throw new ApplicationError('COUNTRY_NOT_FOUND');
          }
        })(),
      );
    }

    if (data.city !== undefined) {
      checks.push(
        (async () => {
          const city = await this.citiesService.findById(data.city!);

          if (!city) {
            throw new ApplicationError('CITY_NOT_FOUND');
          }
        })(),
      );
    }

    await Promise.all(checks);
  }
}
