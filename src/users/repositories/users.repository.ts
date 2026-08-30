import { UserEntity } from '../entities/user.entity';
import { CreateUserInput } from '../inputs/create-user.input';
import { UserFilter } from './user-filter';

export interface UserRepository {
  create(user: CreateUserInput): Promise<UserEntity>;
  findOne(filter: UserFilter): Promise<UserEntity | null>;
}
