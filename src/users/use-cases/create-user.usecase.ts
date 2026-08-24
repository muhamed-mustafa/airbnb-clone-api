import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { isDuplicateKeyError } from '../../common/database/is-duplicate-key-error';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async execute(body: CreateUserDto): Promise<UserResponseDto> {
    const { email, phone, password } = body;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException('auth.USER_ALREADY_EXISTS');
    }

    const hashedPassword = await argon2.hash(password);

    try {
      const user = await this.userModel.create({
        ...body,
        password: hashedPassword,
      });

      return plainToInstance(UserResponseDto, user);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ConflictException('auth.USER_ALREADY_EXISTS');
      throw error;
    }
  }
}
