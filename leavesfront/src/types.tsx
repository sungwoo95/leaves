export type AddDirectory = (tartgetId: null | string, type: DirectoryType, treeId?: string) => void;

export type UpdateIsNew = (targetId: string) => void;

export type UpdateName = (targetId: string, newName: string) => void;

export type OnClickMenuHandler = (e: React.MouseEvent) => void;

export enum DirectoryType {
  FOLDER = "folder",
  FILE = "file",
}

export type Directory = {
  id: string;
  treeId?: string;
  type: DirectoryType;
  isNew: boolean;
  name: string;
  children: Directory[];
};

export type Position = {
  top: number;
  left: number;
};

export type MyForestInfo = {
  forestId: string;
  isOwner: boolean;
};

export enum WsMessageType {
  JOIN_LEAF = "joinLeaf",
  UPDATE_LEAF_TITLE = "updateTitle",
}
