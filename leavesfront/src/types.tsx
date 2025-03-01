export type AddDirectory = (parentId: null | string, type: DirectoryType) => void;

export enum DirectoryType {
  FOLDER = "folder",
  FILE = "file",
}

export type Directory = {
  id: string;
  type: DirectoryType; // ✅ enum 사용
  name: string;
  children: Directory[];
};
