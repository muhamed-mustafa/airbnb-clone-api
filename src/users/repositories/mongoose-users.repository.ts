import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, QueryFilter } from 'mongoose';
import { getDuplicateKeyField } from '../../common/database/is-duplicate-key-error';
import { ERROR_CODES } from '../../common/errors-handling/error-codes';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserEntity } from '../entities/user.entity';
import { CreateUserInput } from '../inputs/create-user.input';
import { UserMapper } from '../mappers/user.mapper';
import { User } from '../schemas/user.schema';
import { UserRepository } from './users.repository';

@Injectable()
export class MongooseUsersRepository implements UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(user: CreateUserInput): Promise<UserResponseDto> {
    const { name, email, phone, password } = user;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone';
      throw new ConflictException({ code: ERROR_CODES.USER_ALREADY_EXISTS, field });
    }

    try {
      const user = await this.userModel.create({
        name,
        phone,
        email,
        password,
      });

      return plainToInstance(UserResponseDto, user);
    } catch (error: unknown) {
      const duplicateField = getDuplicateKeyField(error);

      if (duplicateField === 'email' || duplicateField === 'phone') {
        throw new ConflictException({
          code: ERROR_CODES.USER_ALREADY_EXISTS,
          field: duplicateField,
        });
      }

      throw error;
    }
  }

  async findOne(filter: QueryFilter<User>): Promise<UserEntity | null> {
    const user = await this.userModel.findOne(filter);
    if (!user) return null;
    return UserMapper.toResponse(user);
  }
}
