import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model, QueryFilter } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ConflictException } from '../common/errors-handling/custom-exceptions/conflict-exception';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly i18nService: I18nService,
  ) {}

  async create(user: CreateUserDto) {
    const { email, phone, password } = user;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException(this.i18nService.translate('auth.USER_ALREADY_EXISTS'));
    }

    const hashedPassword = await argon2.hash(password);

    return this.userModel.create({
      ...user,
      password: hashedPassword,
    });
  }

  async findOne(filter: QueryFilter<User>) {
    return this.userModel.findOne(filter);
  }
}
