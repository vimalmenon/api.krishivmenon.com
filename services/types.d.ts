export interface IBaseDB {
  appKey?: string;
  sortKey?: string;
  createdBy?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface IFile extends IBaseDB {
  name: string;
  metadata?: Record<string, string>;
  label: string;
  path: string;
  type: string;
}

export interface INote extends IBaseDB {
  uid: string;
  title:string;
  metadata?: Record<string, string>;
  content: string;
}