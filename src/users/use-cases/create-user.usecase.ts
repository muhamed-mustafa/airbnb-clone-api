import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { getDuplicateKeyField } from '../../common/database/is-duplicate-key-error';
import { ERROR_CODES } from '../../common/errors-handling/error-codes';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserInput } from '../inputs/create-user.input';
import { User } from '../schemas/user.schema';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async execute(body: CreateUserInput): Promise<UserResponseDto> {
    const { name, email, phone, password } = body;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone';
      throw new ConflictException({ code: ERROR_CODES.USER_ALREADY_EXISTS, field });
    }

    const hashedPassword = await argon2.hash(password);

    try {
      const user = await this.userModel.create({
        name,
        phone,
        email,
        password: hashedPassword,
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
}
