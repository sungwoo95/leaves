import { type Edge, type Node } from "@xyflow/react";
import { ObjectId } from "mongodb";

export enum IsConquer {
  TRUE = "true",
  FALSE = "false"
};
export type NodeData = {
  label: string;
  isConquer: IsConquer;
};

export type Position = {
  x: number;
  y: number;
};

export type Tree = {
  nodes: Node<NodeData>[];
  edges: Edge[];
};

export type User = {
  password: string,
  email: string,
  directories: Directory[],
  myForests: MyForestInfo[],
  treeId: string | undefined,
  leafId: string | undefined,
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
  parentLeafId: string | null,
  owningTreeId?: string,
  title: string,
  contents: string, //blocknote에 맞게 변경 필요.
}

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
