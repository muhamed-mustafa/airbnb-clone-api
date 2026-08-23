import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ConflictException } from '../../common/errors-handling/custom-exceptions/conflict-exception';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../schemas/user.schema';
import { UserResponseDto } from '../dtos/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly i18nService: I18nService,
  ) {}

  async execute(body: CreateUserDto): Promise<UserResponseDto> {
    const { email, phone, password } = body;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException(this.i18nService.translate('auth.USER_ALREADY_EXISTS'));
    }

    const hashedPassword = await argon2.hash(password);

    const user = await this.userModel.create({
      ...body,
      password: hashedPassword,
    });

    return plainToInstance(UserResponseDto, user);
  }
}
