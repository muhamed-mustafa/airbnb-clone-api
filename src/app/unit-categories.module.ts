import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UNIT_CATEGORY_REPOSITORY } from '@application/unit-categories/repositories/unit-category-repository.token';
import { UnitCategoryService } from '@application/unit-categories/services/unit-category.service';
import { CreateUnitCategoryUseCase } from '@application/unit-categories/use-cases/create-unit-category.usecase';
import { DeleteUnitCategoryUseCase } from '@application/unit-categories/use-cases/delete-unit-category.usecase';
import { FindAllUnitCategoriesUseCase } from '@application/unit-categories/use-cases/find-all-unit-categories.usecase';
import { FindUnitCategoryByIdUseCase } from '@application/unit-categories/use-cases/find-unit-category-by-id.usecase';
import { UpdateUnitCategoryUseCase } from '@application/unit-categories/use-cases/update-unit-category.usecase';
import { MongooseUnitCategoryRepository } from '@infrastructure/unit-categories/repositories/mongoose-unit-category.repository';
import {
  UnitCategory,
  UnitCategorySchema,
} from '@infrastructure/unit-categories/schemas/unit-categories.schema';
import { UnitCategoryController } from '@presentation/unit-categories/unit-category.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UnitCategory.name, schema: UnitCategorySchema }])],
  controllers: [UnitCategoryController],
  providers: [
    UnitCategoryService,
    CreateUnitCategoryUseCase,
    FindAllUnitCategoriesUseCase,
    FindUnitCategoryByIdUseCase,
    UpdateUnitCategoryUseCase,
    DeleteUnitCategoryUseCase,
    { provide: UNIT_CATEGORY_REPOSITORY, useClass: MongooseUnitCategoryRepository },
  ],
  exports: [UnitCategoryService],
})
export class UnitCategoriesModule {}
