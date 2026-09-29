import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminEntity } from '../../../../application/admin/entities/admin.entity';
import { CreateAdminInput } from '../../../../application/admin/inputs/create-admin.input';
import { AdminFilter } from '../../../../application/admin/repositories/admin-filter';
import { AdminRepository } from '../../../../application/admin/repositories/admin.repository';
import { AdminMapper } from '../../mappers/admin.mapper';
import { Admin } from '../admin.schema';

@Injectable()
export class MongooseAdminRepository implements AdminRepository {
  constructor(@InjectModel(Admin.name) private readonly adminModel: Model<Admin>) {}

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
        ...(filter.name !== undefined ? { name: filter.name } : {}),
        ...(filter.email !== undefined ? { email: filter.email } : {}),
        ...(filter.isSuperAdmin !== undefined ? { isSuperAdmin: filter.isSuperAdmin } : {}),
        isDeleted: false,
      })
      .exec();

    return admin ? AdminMapper.toEntity(admin) : null;
  }
}
