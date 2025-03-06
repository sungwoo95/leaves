export type User = {
  id: string,
  password: string,
  email: string,
  directories: Directory[],
  forests: ForestInfo[],
  treeId: string | null,
  leafId: string | null,
}

export type ForestInfo = {
  forestId: string, //값은 Forest의 _id
  forestName: string,
  isOwner: boolean
}

export type Forest = {
  directories: Directory[]
}

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