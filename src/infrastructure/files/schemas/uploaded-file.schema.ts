import { FILE_STORAGE_PROVIDERS, type FileStorageProvider } from '@common/config/env.types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UploadedFile {
  @Prop({ required: true, type: String, enum: FILE_STORAGE_PROVIDERS })
  provider!: FileStorageProvider;

  @Prop({ required: true })
  key!: string;

  @Prop({ required: true, index: true })
  url!: string;

  @Prop({ required: true })
  uploadedBy!: string;

  @Prop({ required: true })
  createdAt!: Date;
}

export const UploadedFileSchema = SchemaFactory.createForClass(UploadedFile);
UploadedFileSchema.index({ provider: 1, key: 1 }, { unique: true });
