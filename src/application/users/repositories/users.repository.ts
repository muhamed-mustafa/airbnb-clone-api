import { UserEntity } from '../entities/user.entity';
import { CreateUserInput } from '../inputs/create-user.input';
import { UserFilter } from './user-filter';

export interface UserRepository {
  create(user: CreateUserInput): Promise<UserEntity>;
  findOne(filter: UserFilter): Promise<UserEntity | null>;
  updateName(id: string, name: string): Promise<UserEntity | null>;
  updatePassword(id: string, password: string): Promise<boolean>;
  issuePasswordResetCode(
    email: string,
    codeHash: string,
    now: Date,
    expiresAt: Date,
  ): Promise<boolean>;
  incrementPasswordResetAttempts(email: string, now: Date): Promise<void>;
  verifyPasswordResetCode(
    email: string,
    codeHash: string,
    now: Date,
    tokenHash: string,
    tokenExpiresAt: Date,
  ): Promise<boolean>;
  hasValidPasswordResetToken(tokenHash: string, now: Date): Promise<boolean>;
  resetPassword(tokenHash: string, passwordHash: string, now: Date): Promise<string | null>;
  issueActivationCode(
    email: string,
    codeHash: string,
    now: Date,
    expiresAt: Date,
  ): Promise<boolean>;
  incrementActivationAttempts(email: string, now: Date): Promise<void>;
  activateEmail(email: string, codeHash: string, now: Date): Promise<string | null>;
}
