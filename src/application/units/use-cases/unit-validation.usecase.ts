import { AppSettingsService } from '@application/app-settings/services/app-settings.service';
import { CityService } from '@application/cities/services/city.service';
import { CountryService } from '@application/countries/services/country.service';
import { UnitCategoryService } from '@application/unit-categories/services/unit-category.service';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
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

  async execute(data: CreateUnitInput) {
    const [appSettings, unitCategory, country, city] = await Promise.all([
      this.appSettingsService.findOne(),
      this.unitCategoriesService.findById(data.unitCategory),
      this.countriesService.findById(data.country),
      this.citiesService.findById(data.city),
    ]);

    if (data.costPerDay < appSettings.minPrice) {
      throw new ApplicationError('UNIT_COST_PER_DAY_TOO_LOW_MIN_PRICE');
    }

    if (!unitCategory) {
      throw new ApplicationError('UNIT_CATEGORY_NOT_FOUND');
    }

    if (!country) {
      throw new ApplicationError('COUNTRY_NOT_FOUND');
    }

    if (!city) {
      throw new ApplicationError('CITY_NOT_FOUND');
    }
  }
}
