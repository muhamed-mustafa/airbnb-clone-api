import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserUseCase } from './use-cases/create-user.usecase';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, CreateUserUseCase],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
