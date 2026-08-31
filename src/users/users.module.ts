import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseUsersRepository } from './repositories/mongoose-users.repository';
import { USER_REPOSITORY_TOKEN } from './repositories/user-repository.token';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, { provide: USER_REPOSITORY_TOKEN, useClass: MongooseUsersRepository }],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
