export const DYNAMO_DB_Table = process.env.DYNAMO_DB_Table;
export const DB_KEY = process.env.DB_KEY;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
export const USER_POOL_ID = process.env.USER_POOL_ID;
export const CLIENT_ID = process.env.CLIENT_ID;

export const FileTypeExtensionMapping: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/json': 'json',
  'video/quicktime': 'mov',
  'video/mp4': 'mp4',
  'audio/mpeg': 'mp3',
};

export const SupportedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'application/pdf',
  'application/zip',
  'application/json',
  'video/quicktime',
  'video/mp4',
  'audio/mpeg',
];

export const StorageFolderMapping: Record<string, string> = {
  image: 'images',
  file: 'files',
  video: 'videos',
  audio: 'audios',
};
export const DriveFolderMapping: Record<string, string> = {
  'image/jpeg': StorageFolderMapping.image,
  'image/png': StorageFolderMapping.image,
  'image/heic': StorageFolderMapping.image,
  'application/pdf': StorageFolderMapping.file,
  'application/zip': StorageFolderMapping.file,
  'application/json': StorageFolderMapping.file,
  'video/quicktime': StorageFolderMapping.video,
  'video/mp4': StorageFolderMapping.video,
  'audio/mpeg': StorageFolderMapping.audio,
};

export const commonTableColumn = ['updatedDate', 'createdDate', 'createdBy'];
