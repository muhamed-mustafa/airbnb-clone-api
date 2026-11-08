import type {
  UploadedFileDeletion,
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

  async scheduleDeletion(file: UploadedFileRecord): Promise<void> {
    const { status: _status, ...metadata } = file;

    await this.model
      .updateOne(
        { provider: file.provider, key: file.key },
        {
          $setOnInsert: {
            ...metadata,
            status: 'pendingDeletion',
          },
        },
        { upsert: true },
      )
      .exec();
  }

  async markPhotosForDeletion(urls: string[]): Promise<void> {
    const uniqueUrls = [...new Set(urls)];
    if (uniqueUrls.length === 0) return;

    await this.model
      .updateMany(
        { url: { $in: uniqueUrls }, status: 'active' },
        { $set: { status: 'pendingDeletion' }, $inc: { revision: 1 } },
      )
      .exec();
  }

  async bindPhotos(urls: string[], session: TransactionSession): Promise<boolean> {
    const uniqueUrls = [...new Set(urls)];
    if (uniqueUrls.length === 0) return true;

    const result = await this.model
      .updateMany(
        { url: { $in: uniqueUrls }, status: 'active' },
        { $inc: { revision: 1 } },
        { session: toClientSession(session) },
      )
      .exec();

    return result.matchedCount === uniqueUrls.length;
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

    const trackedUrls = files.filter((file) => file.status === 'active').map((file) => file.url);

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

  async findPendingDeletions(): Promise<UploadedFileDeletion[]> {
    return this.model
      .find({ status: 'pendingDeletion' })
      .select({ provider: 1, key: 1, url: 1 })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }

  async markDeleted(provider: FileStorageProvider, key: string): Promise<void> {
    await this.model
      .updateOne({ provider, key, status: 'pendingDeletion' }, { $set: { status: 'deleted' } })
      .exec();
  }
}
