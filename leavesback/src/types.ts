import { ObjectId } from "mongodb";

export type NodeData = {
  id: string;
  label: string;
};

export type Position = {
  x: number;
  y: number;
};

export type EdgeData = {
  source: string;
  target: string;
  label: string;
};

export type Tree = {
  nodes: { data: NodeData; position: Position }[];
  edges: { data: EdgeData }[];
};

export type User = {
  password: string,
  email: string,
  directories: Directory[],
  myForests: MyForestInfo[],
  treeId: string | null,
  leafId: string | null,
}

export type MyForestInfo = {
  forestId: ObjectId,
  isOwner: boolean,
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

export type Leaf = {
  title: string,
  contents: string, //blocknote에 맞게 변경 필요.
}