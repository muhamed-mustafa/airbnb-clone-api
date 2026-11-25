import { modelNames } from '@common/constants/model-names.constant';
import { UnitFavoriteSchema } from './unit-favorite.schema';

describe('UnitFavoriteSchema', () => {
  it('references users and units and prevents duplicate user-unit favorites', () => {
    expect(UnitFavoriteSchema.path('user').options.ref).toBe(modelNames.USERS);
    expect(UnitFavoriteSchema.path('unit').options.ref).toBe(modelNames.UNITS);

    const uniqueUserUnitIndex = UnitFavoriteSchema.indexes().find(
      ([keys]) => keys.user === 1 && keys.unit === 1,
    );

    expect(uniqueUserUnitIndex?.[1]).toMatchObject({
      unique: true,
      name: 'uniq_user_unit_favorite',
    });
  });

  it('indexes a user favorite list in newest-first order', () => {
    const recentFavoritesIndex = UnitFavoriteSchema.indexes().find(
      ([keys]) => keys.user === 1 && keys.createdAt === -1 && keys._id === -1,
    );

    expect(recentFavoritesIndex?.[1]).toMatchObject({ name: 'user_favorites_recent' });
  });
});
