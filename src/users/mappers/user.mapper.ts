import { UserResponseDto } from '../dtos/user-response.dto';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
    };
  }
}
