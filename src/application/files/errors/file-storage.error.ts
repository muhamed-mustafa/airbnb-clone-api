export class FileStorageError extends Error {
  constructor(message = 'FILE_STORAGE_OPERATION_FAILED') {
    super(message);

    this.name = FileStorageError.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
