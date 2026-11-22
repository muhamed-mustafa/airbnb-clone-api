import { model } from 'mongoose';
import { UserSchema } from './user.schema';

describe('customer activation schema', () => {
  it('persists null for a newly pending customer and accepts a verification date', () => {
    const UserModel = model('UserActivationSchemaTest', UserSchema);
    const pending = new UserModel({
      name: 'Guest',
      email: 'guest@example.com',
      phone: '+201000000000',
      password: 'hashed',
      emailVerifiedAt: null,
    });
    expect(pending.toObject().emailVerifiedAt).toBeNull();
    const verifiedAt = new Date('2026-11-19T12:00:00.000Z');
    pending.emailVerifiedAt = verifiedAt;
    expect(pending.toObject().emailVerifiedAt).toEqual(verifiedAt);
  });
});
