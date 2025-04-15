import { Edge, type Node } from "@xyflow/react";
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
  UPDATE_LEAF_TITLE = "updateLeafTitle",
  UPDATE_LEAF_TITLE_ERROR = "updateLeafTitleError",
  UPDATE_LEAF_PARENT = "updateLeafParent",
  ADD_CHILD_LEAF = "addChildLeaf",
  ADD_PARENT_LEAF = "addParentLeaf",
  JOIN_TREE = "joinTree",
  UPDATE_TREE_LABEL = "updateTreeLabel",
  UPDATE_TREE_ADD_CHILD_LEAF = "updateTreeAddChildLeaf",
  UPDATE_TREE_ADD_PARENT_LEAF = "updateTreeAddParentLeaf",
  UPDATE_TREE_CONQUER = "updateTreeConquer",
}

export enum IsConquer {
  TRUE = "true",
  FALSE = "false"
};

export interface CustomNode<T extends Record<string, unknown> = any> extends Node<T> {
  x: number;
  y: number;
}

export type NodeData = {
  label: string;
  isConquer: IsConquer;
};

export type Tree = {
  nodes: CustomNode<NodeData>[];
  edges: Edge[];
};
