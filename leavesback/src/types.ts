import { ObjectId } from "mongodb";

export type User = {
  password: string,
  email: string,
  directories: Directory[],
  myForests: MyForestInfo[],
  treeId: string | null,
  leafId: string | null,
}

export type MyForestInfo = {
  forestId: ObjectId; 
  isOwner: boolean;
};

export type Forest = {
  name: string,
  directories: Directory[],
  participants: ObjectId[],
}

export enum DirectoryType {
  FOLDER = "folder",
  FILE = "file",
}

export type Directory = {
  id: string,
  type: DirectoryType,
  isNew: boolean,
  name: string,
  children: Directory[],
};