export interface IBaseDB {
  appKey?: string;
  sortKey?: string;
  createdBy?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface IFile extends IBaseDB {
  id: string;
  metadata?: Record<string, string>;
  label: string;
  path: string;
  type: string;
}

export interface INote extends IBaseDB {
  id: string;
  title: string;
  metadata?: Record<string, string>;
  content: string;
}

export interface IFolder extends IBaseDB {
  id: string;
  label: string;
  parent: string;
  isPrivate: boolean;
  metadata?: Record<string, string>;
  canCreateFolder: boolean;
  canUploadFile: boolean;
  canDeleteFolder: boolean;
}

export interface IProfile extends IBaseDB {
  name: string;
  role: string;
  email: string;
  picture: string;
  provider: string;
}

export interface IRole extends IBaseDB {
  name: string;
  roles: string[];
}

export interface IBody {
  data: unknown;
  code: number;
  message: string;
  version: string;
}

export interface IBaseResponseResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded: boolean;
}
