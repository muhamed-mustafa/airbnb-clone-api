import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@infrastructure/users/schemas/user.schema';
import { UsersController } from '@presentation/users/users.controller';
import { UsersService } from '@application/users/services/users.service';
import { MongooseUsersRepository } from '@infrastructure/users/repositories/mongoose-users.repository';
import { USER_REPOSITORY_TOKEN } from '@application/users/repositories/user-repository.token';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, { provide: USER_REPOSITORY_TOKEN, useClass: MongooseUsersRepository }],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
