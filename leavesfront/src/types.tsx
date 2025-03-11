import { ObjectId } from "mongodb";

export type AddDirectory = (tartgetId: null | string, type: DirectoryType) => void;

export type UpdateIsNew = (targetId: string) => void;

export type UpdateName = (targetId: string, newName: string) => void;

export type OnClickMenuHandler = (e: React.MouseEvent) => void;

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

export type Position = {
  top: number;
  left: number;
};

export type ForestMetaData = {
  forestId: ObjectId; //Forest의 _id
  forestName: string;
  isOwner: boolean;
};
