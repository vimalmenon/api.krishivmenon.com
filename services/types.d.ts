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
  metadata?: Record<string, string>;
  label: string;
  parent: string;
  content: string[];
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
