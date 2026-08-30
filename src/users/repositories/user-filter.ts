import { UserEntity } from '../entities/user.entity';

export type UserFilter = Partial<Pick<UserEntity, 'id' | 'email' | 'phone'>>;
