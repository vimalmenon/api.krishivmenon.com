export interface IBaseDB {
  appKey?: string;
  sortKey?: string;
  createdBy?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface IFile extends IBaseDB {
  id: string;
  name: string;
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
  name: string;
  metadata?: Record<string, string>;
  label: string;
  parent: string;
  type: string;
  content: string[];
}
