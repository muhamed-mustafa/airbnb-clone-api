import { UserEntity } from '@application/users/entities/user.entity';

export class UserMapper {
  static toResponse(user: UserEntity): UserEntity {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
    };
  }
}
