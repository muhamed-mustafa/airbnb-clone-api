export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface StoredFile {
  key: string;
  url: string;
}

export interface FileStorage {
  upload(file: UploadFileInput): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}
