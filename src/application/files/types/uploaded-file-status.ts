export const UPLOADED_FILE_STATUSES = ['active', 'pendingDeletion', 'deleting', 'deleted'] as const;

export type UploadedFileStatus = (typeof UPLOADED_FILE_STATUSES)[number];
