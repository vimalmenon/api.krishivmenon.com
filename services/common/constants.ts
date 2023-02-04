export const DYNAMO_DB_Table = process.env.DYNAMO_DB_Table;
export const DB_KEY = process.env.DB_KEY;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const SupportedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "application/pdf",
  "application/zip",
  "application/json",
  "video/quicktime",
  "video/mp4",
  "audio/mpeg",
];

export const StorageFolderMapping: Record<string, string> = {
  image: "images",
  file: "files",
  video: "videos",
  audio: "audios",
};
export const DriveFolderMapping: Record<string, string> = {
  "image/jpeg": StorageFolderMapping.image,
  "image/png": StorageFolderMapping.image,
  "image/heic": StorageFolderMapping.image,
  "application/pdf": StorageFolderMapping.file,
  "application/zip": StorageFolderMapping.file,
  "application/json": StorageFolderMapping.file,
  "video/quicktime": StorageFolderMapping.video,
  "video/mp4": StorageFolderMapping.video,
  "audio/mpeg": StorageFolderMapping.audio,
};
