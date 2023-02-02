const SupportedFolder = ["images", "files", "videos"];

export const isValidFolder = (folder: string): boolean => {
  return SupportedFolder.includes(folder);
};
