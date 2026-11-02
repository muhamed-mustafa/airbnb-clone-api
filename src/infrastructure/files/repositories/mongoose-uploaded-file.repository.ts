import type {
  UploadedFileRecord,
  UploadedFileRepository,
} from '@application/files/repositories/uploaded-file.repository';
import type { FileStorageProvider } from '@common/config/env.types';
import { TransactionSession } from '@common/transactions/transaction-runner';
import { toClientSession } from '@infrastructure/database/mongoose-transaction-runner';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UploadedFile } from '../schemas/uploaded-file.schema';

@Injectable()
export class MongooseUploadedFileRepository implements UploadedFileRepository {
  constructor(@InjectModel(UploadedFile.name) private readonly model: Model<UploadedFile>) {}

  async create(file: UploadedFileRecord): Promise<void> {
    await this.model.create(file);
  }

  async remove(provider: FileStorageProvider, key: string): Promise<void> {
    await this.model.deleteOne({ provider, key }).exec();
  }

  async bindPhotos(url: string[], session: TransactionSession): Promise<boolean> {
    const result = await this.model.updateMany(
      { url: { $in: url } },
      { $set: { status: 'active' } },
      { session: toClientSession(session) },
    );

    return result.modifiedCount === url.length;
  }
}
