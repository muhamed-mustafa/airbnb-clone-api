import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getDuplicateKeyField } from '@infrastructure/database/is-duplicate-key-error';
import { ERROR_CODES } from '@common/errors/error-codes';
import { UserEntity } from '@application/users/entities/user.entity';
import { CreateUserInput } from '@application/users/inputs/create-user.input';
import { UserMapper } from '../mappers/user.mapper';
import { User } from '../schemas/user.schema';
import { UserFilter } from '@application/users/repositories/user-filter';
import { UserRepository } from '@application/users/repositories/users.repository';
import { modelNames } from '@common/constants/model-names.constant';

@Injectable()
export class MongooseUsersRepository implements UserRepository {
  constructor(@InjectModel(modelNames.USERS) private readonly userModel: Model<User>) {}

  async create(user: CreateUserInput): Promise<UserEntity> {
    const { name, email, phone, password, emailVerifiedAt } = user;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone';
      throw new ConflictException({ code: ERROR_CODES.USER_ALREADY_EXISTS, field });
    }

    try {
      const user = await this.userModel.create({
        name,
        phone,
        email,
        password,
        ...(emailVerifiedAt === null ? { emailVerifiedAt: null } : {}),
      });

      return UserMapper.toResponse(user);
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

  async updateName(id: string, name: string): Promise<UserEntity | null> {
    const user = await this.userModel.findByIdAndUpdate(id, { $set: { name } }, { new: true });
    return user ? UserMapper.toResponse(user) : null;
  }

  async updatePassword(id: string, password: string): Promise<boolean> {
    const result = await this.userModel.updateOne({ _id: id }, { $set: { password } });
    return result.matchedCount === 1;
  }

  async issuePasswordResetCode(
    email: string,
    codeHash: string,
    now: Date,
    expiresAt: Date,
  ): Promise<boolean> {
    const updated = await this.userModel.findOneAndUpdate(
      {
        email,
        $or: [
          { passwordResetRequestedAt: { $exists: false } },
          { passwordResetRequestedAt: { $lte: new Date(now.getTime() - 60_000) } },
        ],
      },
      {
        $set: {
          passwordResetCodeHash: codeHash,
          passwordResetExpiresAt: expiresAt,
          passwordResetRequestedAt: now,
          passwordResetAttempts: 0,
        },
        $unset: { passwordResetTokenHash: 1, passwordResetTokenExpiresAt: 1 },
      },
    );
    return updated !== null;
  }

  async incrementPasswordResetAttempts(email: string, now: Date): Promise<void> {
    await this.userModel.updateOne(
      { email, passwordResetExpiresAt: { $gt: now }, passwordResetAttempts: { $lt: 5 } },
      { $inc: { passwordResetAttempts: 1 } },
    );
  }

  async verifyPasswordResetCode(
    email: string,
    codeHash: string,
    now: Date,
    tokenHash: string,
    tokenExpiresAt: Date,
  ): Promise<boolean> {
    const updated = await this.userModel.findOneAndUpdate(
      {
        email,
        passwordResetCodeHash: codeHash,
        passwordResetExpiresAt: { $gt: now },
        passwordResetAttempts: { $lt: 5 },
      },
      {
        $set: { passwordResetTokenHash: tokenHash, passwordResetTokenExpiresAt: tokenExpiresAt },
        $unset: { passwordResetCodeHash: 1, passwordResetExpiresAt: 1 },
      },
    );
    return updated !== null;
  }

  async hasValidPasswordResetToken(tokenHash: string, now: Date): Promise<boolean> {
    return (
      (await this.userModel.exists({
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: { $gt: now },
      })) !== null
    );
  }

  async resetPassword(tokenHash: string, passwordHash: string, now: Date): Promise<string | null> {
    const updated = await this.userModel.findOneAndUpdate(
      { passwordResetTokenHash: tokenHash, passwordResetTokenExpiresAt: { $gt: now } },
      {
        $set: { password: passwordHash },
        $unset: {
          passwordResetCodeHash: 1,
          passwordResetExpiresAt: 1,
          passwordResetRequestedAt: 1,
          passwordResetAttempts: 1,
          passwordResetTokenHash: 1,
          passwordResetTokenExpiresAt: 1,
        },
      },
    );
    return updated?._id.toString() ?? null;
  }

  async issueActivationCode(
    email: string,
    codeHash: string,
    now: Date,
    expiresAt: Date,
  ): Promise<boolean> {
    const updated = await this.userModel.findOneAndUpdate(
      {
        email,
        emailVerifiedAt: { $exists: true, $eq: null },
        $or: [
          { emailActivationRequestedAt: { $exists: false } },
          { emailActivationRequestedAt: { $lte: new Date(now.getTime() - 60_000) } },
        ],
      },
      {
        $set: {
          emailActivationCodeHash: codeHash,
          emailActivationExpiresAt: expiresAt,
          emailActivationRequestedAt: now,
          emailActivationAttempts: 0,
        },
      },
    );
    return updated !== null;
  }

  async incrementActivationAttempts(email: string, now: Date): Promise<void> {
    await this.userModel.updateOne(
      {
        email,
        emailVerifiedAt: { $exists: true, $eq: null },
        emailActivationExpiresAt: { $gt: now },
        emailActivationAttempts: { $lt: 5 },
      },
      { $inc: { emailActivationAttempts: 1 } },
    );
  }

  async activateEmail(email: string, codeHash: string, now: Date): Promise<string | null> {
    const updated = await this.userModel.findOneAndUpdate(
      {
        email,
        emailVerifiedAt: { $exists: true, $eq: null },
        emailActivationCodeHash: codeHash,
        emailActivationExpiresAt: { $gt: now },
        emailActivationAttempts: { $lt: 5 },
      },
      {
        $set: { emailVerifiedAt: now },
        $unset: {
          emailActivationCodeHash: 1,
          emailActivationExpiresAt: 1,
          emailActivationRequestedAt: 1,
          emailActivationAttempts: 1,
        },
      },
    );
    return updated?._id.toString() ?? null;
  }

  async findOne(filter: UserFilter): Promise<UserEntity | null> {
    const { id, ...rest } = filter;
    const user = await this.userModel.findOne(id ? { _id: id, ...rest } : rest);
    if (!user) return null;
    return UserMapper.toResponse(user);
  }
}
