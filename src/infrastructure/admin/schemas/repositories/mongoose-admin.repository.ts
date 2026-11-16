import { AdminEntity } from '@application/admin/entities/admin.entity';
import { CreateAdminInput } from '@application/admin/inputs/create-admin.input';
import { AdminFilter } from '@application/admin/repositories/admin-filter';
import { AdminRepository } from '@application/admin/repositories/admin.repository';
import { modelNames } from '@common/constants/model-names.constant';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminMapper } from '../../mappers/admin.mapper';
import { Admin } from '../admin.schema';

@Injectable()
export class MongooseAdminRepository implements AdminRepository {
  constructor(@InjectModel(modelNames.ADMINS) private readonly adminModel: Model<Admin>) {}

  async create(data: CreateAdminInput): Promise<AdminEntity> {
    const admin = await this.adminModel.create(data);
    return AdminMapper.toEntity(admin);
  }

  async find(filter: AdminFilter): Promise<{ items: AdminEntity[]; total: number }> {
    const { page = 1, limit = 10, name, email, isSuperAdmin } = filter;

    const escapedName = name?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const query = {
      ...(escapedName ? { name: { $regex: escapedName, $options: 'i' } } : {}),
      ...(email ? { email } : {}),
      ...(isSuperAdmin !== undefined ? { isSuperAdmin } : {}),
      isDeleted: false,
    };
    const [admins, total] = await Promise.all([
      this.adminModel
        .find(query)
        .sort({ name: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),

      this.adminModel.countDocuments(query),
    ]);

    return {
      items: admins.map((admin) => AdminMapper.toEntity(admin)),
      total,
    };
  }

  async findOne(filter: AdminFilter): Promise<AdminEntity | null> {
    const admin = await this.adminModel
      .findOne({
        ...(filter.id !== undefined ? { _id: filter.id } : {}),
        ...(filter.name !== undefined ? { name: filter.name } : {}),
        ...(filter.email !== undefined ? { email: filter.email } : {}),
        ...(filter.isSuperAdmin !== undefined ? { isSuperAdmin: filter.isSuperAdmin } : {}),
        isDeleted: false,
      })
      .exec();

    return admin ? AdminMapper.toEntity(admin) : null;
  }

  async issuePasswordResetCode(
    email: string,
    codeHash: string,
    now: Date,
    expiresAt: Date,
  ): Promise<boolean> {
    const updated = await this.adminModel
      .findOneAndUpdate(
        {
          email: email.toLowerCase(),
          isDeleted: false,
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
      )
      .exec();

    return updated !== null;
  }

  async incrementPasswordResetAttempts(email: string, now: Date): Promise<void> {
    await this.adminModel
      .updateOne(
        {
          email: email.toLowerCase(),
          isDeleted: false,
          passwordResetExpiresAt: { $gt: now },
          passwordResetAttempts: { $lt: 5 },
        },
        { $inc: { passwordResetAttempts: 1 } },
      )
      .exec();
  }

  async verifyPasswordResetCode(
    email: string,
    codeHash: string,
    now: Date,
    tokenHash: string,
    tokenExpiresAt: Date,
  ): Promise<boolean> {
    const updated = await this.adminModel
      .findOneAndUpdate(
        {
          email: email.toLowerCase(),
          isDeleted: false,
          passwordResetCodeHash: codeHash,
          passwordResetExpiresAt: { $gt: now },
          passwordResetAttempts: { $lt: 5 },
        },
        {
          $set: { passwordResetTokenHash: tokenHash, passwordResetTokenExpiresAt: tokenExpiresAt },
          $unset: { passwordResetCodeHash: 1, passwordResetExpiresAt: 1 },
        },
      )
      .exec();

    return updated !== null;
  }

  async resetPassword(tokenHash: string, passwordHash: string, now: Date): Promise<string | null> {
    const updated = await this.adminModel
      .findOneAndUpdate(
        {
          passwordResetTokenHash: tokenHash,
          passwordResetTokenExpiresAt: { $gt: now },
          isDeleted: false,
        },
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
      )
      .exec();

    return updated?._id.toString() ?? null;
  }

  async hasValidPasswordResetToken(tokenHash: string, now: Date): Promise<boolean> {
    const admin = await this.adminModel.exists({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: { $gt: now },
      isDeleted: false,
    });

    return admin !== null;
  }
}
