import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './schemas/user.schema';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { UserResponseDto } from './dtos/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  async create(user: CreateUserDto): Promise<UserResponseDto> {
    return await this.createUserUseCase.execute(user);
  }

  async findOne(filter: QueryFilter<User>) {
    return this.userModel.findOne(filter);
  }
}
