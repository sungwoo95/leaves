export type AddDirectory = (parentId: null | string, type: DirectoryType) => void;

export type UpdateIsNew = (id: string) => void;
export enum DirectoryType {
  FOLDER = "folder",
  FILE = "file",
}

export type Directory = {
  id: string;
  type: DirectoryType;
  isNew: boolean;
  name: string;
  children: Directory[];
};
