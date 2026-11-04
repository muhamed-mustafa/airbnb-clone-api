import type {
  UploadedFileRecord,
  UploadedFileRepository,
} from '@application/files/repositories/uploaded-file.repository';
import type { FileStorageProvider } from '@common/config/env.types';
import type { TransactionSession } from '@common/transactions/transaction-runner';
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
    const result = await this.model
      .updateMany(
        { url: { $in: url }, status: 'active' },
        { $inc: { revision: 1 } },
        { session: toClientSession(session) },
      )
      .exec();

    return result.matchedCount === url.length;
  }

  async reservePhotosForDeletion(urls: string[], session: TransactionSession): Promise<boolean> {
    if (urls.length === 0) return true;

    const clientSession = toClientSession(session);

    const files = await this.model
      .find({ url: { $in: urls } })
      .select({ url: 1, status: 1 })
      .session(clientSession ?? null)
      .lean()
      .exec();

    if (files.some((file) => file.status !== 'active')) {
      return false;
    }

    const trackedUrls = files.map((file) => file.url);

    if (trackedUrls.length === 0) return true;

    const result = await this.model
      .updateMany(
        { url: { $in: trackedUrls }, status: 'active' },
        {
          $set: { status: 'pendingDeletion' },
          $inc: { revision: 1 },
        },
        { session: clientSession },
      )
      .exec();

    return result.matchedCount === trackedUrls.length;
  }
}
