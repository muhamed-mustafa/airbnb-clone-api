import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserInput } from './inputs/create-user.input';
import { User } from './schemas/user.schema';
import { CreateUserUseCase } from './use-cases/create-user.usecase';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  async create(user: CreateUserInput): Promise<UserResponseDto> {
    return await this.createUserUseCase.execute(user);
  }

  async findOne(filter: QueryFilter<User>) {
    return this.userModel.findOne(filter);
  }
}
