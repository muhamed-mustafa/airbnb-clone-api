import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, QueryFilter } from 'mongoose';
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

  create(user: CreateUserInput): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(user);
  }

  findOne(filter: QueryFilter<User>): Promise<HydratedDocument<User> | null> {
    return this.userModel.findOne(filter).exec();
  }
}
