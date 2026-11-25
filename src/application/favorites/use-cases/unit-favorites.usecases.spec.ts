import { AddUnitFavoriteUseCase } from '@application/favorites/use-cases/add-unit-favorite.usecase';
import { FindMyUnitFavoritesUseCase } from '@application/favorites/use-cases/find-my-unit-favorites.usecase';
import { RemoveUnitFavoriteUseCase } from '@application/favorites/use-cases/remove-unit-favorite.usecase';
import { UnitService } from '@application/units/services/unit.service';

describe('unit favorite use cases', () => {
  const userId = '670d1234567890abcdef1238';
  const unitId = '670d1234567890abcdef1237';
  const unit = { id: unitId, title: 'Sea view apartment', isActive: true };
  const favorite = { id: '670d1234567890abcdef1241', user: userId, unit, createdAt: new Date() };
  const repository = {
    add: jest.fn(),
    findForUser: jest.fn(),
    remove: jest.fn(),
  };
  const unitService = { findOne: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('only adds a favorite after confirming the unit exists and is active', async () => {
    repository.add.mockResolvedValue(favorite);
    unitService.findOne.mockResolvedValue(unit);
    const useCase = new AddUnitFavoriteUseCase(unitService as unknown as UnitService, repository);

    await expect(useCase.execute(userId, unitId)).resolves.toBe(favorite);
    expect(unitService.findOne).toHaveBeenCalledWith({ id: unitId, isActive: true });
    expect(repository.add).toHaveBeenCalledWith(userId, unitId);
  });

  it('does not write a favorite when the unit lookup fails', async () => {
    const error = new Error('Unit not found');
    unitService.findOne.mockRejectedValue(error);
    const useCase = new AddUnitFavoriteUseCase(unitService as unknown as UnitService, repository);

    await expect(useCase.execute(userId, unitId)).rejects.toBe(error);
    expect(repository.add).not.toHaveBeenCalled();
  });

  it('returns the authenticated user favorites with pagination metadata', async () => {
    repository.findForUser.mockResolvedValue({ items: [favorite], total: 21 });
    const useCase = new FindMyUnitFavoritesUseCase(repository);

    await expect(useCase.execute(userId, 2, 10)).resolves.toEqual({
      data: [favorite],
      meta: {
        page: 2,
        limit: 10,
        total: 21,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
    expect(repository.findForUser).toHaveBeenCalledWith(userId, 2, 10);
  });

  it('removes favorites only for the authenticated user and selected unit', async () => {
    repository.remove.mockResolvedValue(undefined);
    const useCase = new RemoveUnitFavoriteUseCase(repository);

    await expect(useCase.execute(userId, unitId)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(userId, unitId);
  });
});
