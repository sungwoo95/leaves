import { ObjectId } from "mongodb";

export type User = {
  password: string,
  email: string,
  directories: Directory[],
  forests: ForestMetaData[],
  treeId: string | null,
  leafId: string | null,
}

export type ForestMetaData = {
  forestId: ObjectId, //Forest의 _id
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