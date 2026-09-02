import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserEntity } from '../entities/user.entity';
import { CreateUserInput } from '../inputs/create-user.input';

export class UserMapper {
  static toInput(dto: CreateUserDto): CreateUserInput {
    return {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
    };
  }
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
