export enum IsConquer {
  TRUE = 'true',
  FALSE = 'false',
}

export enum DeleteCase {
  HAS_PARENT = 'HAS_PARENT',
  ROOT_WITH_SINGLE_CHILD = 'ROOT_WITH_SINGLE_CHILD',
  CHANGE_TO_EMPTY_LEAF = 'CHANGE_TO_EMPTY_LEAF',
}

export type NodeData = {
  id: string;
  label: string;
  isConquer: IsConquer;
};

export type NodePosition = {
  x: number;
  y: number;
};

export type EdgeData = {
  source: string;
  target: string;
  label?: string;
};

export type Node = {
  data: NodeData;
  position?: NodePosition;
};

export type Edge = {
  data: EdgeData;
};

export type Tree = {
  forestId: string;
  nodes: Node[];
  edges: Edge[];
};

export type User = {
  sub: string;
  myForests: MyForestInfo[];
  treeId: string | undefined;
  leafId: string | undefined;
};

export type MyForestInfo = {
  forestId: string;
  isOwner: boolean;
};

export type Forest = {
  owner: string;
  name: string;
  directories: Directory[];
  participants: string[];
};

export enum DirectoryType {
  FOLDER = 'folder',
  FILE = 'file',
}

export type Directory = {
  id: string;
  treeId?: string;
  type: DirectoryType;
  isNew: boolean;
  name: string;
  children: Directory[];
};

export type Leaf = {
  forestId: string;
  parentLeafId: string | null;
  owningTreeId?: string;
  title: string;
  contents: string; //blocknote에 맞게 변경 필요.
};

export enum WsMessageType {
  UPDATE_LEAF_TITLE = 'updateLeafTitle',
  UPDATE_LEAF_TITLE_ERROR = 'updateLeafTitleError',
  UPDATE_LEAF_PARENT = 'updateLeafParent',
  UPDATE_LEAF_DELETE_LEAF = 'UPDATE_LEAF_DELETE_LEAF',
  ADD_CHILD_LEAF = 'addChildLeaf',
  ADD_PARENT_LEAF = 'addParentLeaf',
  DELETE_LEAF = 'deleteLeaf',
  UPDATE_TREE_LABEL = 'updateTreeLabel',
  UPDATE_TREE_ADD_CHILD_LEAF = 'updateTreeAddChildLeaf',
  UPDATE_TREE_ADD_PARENT_LEAF = 'updateTreeAddParentLeaf',
  UPDATE_TREE_CONQUER = 'updateTreeConquer',
  UPDATE_TREE_DELETE_LEAF = 'UPDATE_TREE_DELETE_LEAF',
  UPDATE_FOREST_DIRECTORIES = 'updateforestdirectories',
  UPDATE_FOREST_NAME = 'updateforestname',
  DELETE_FOREST = 'deleteforest',
  LEAVE_GROUP = 'leaveGroup',
  JOIN_GROUP = 'joinGroup',
}

export type DeleteLeafData = {
  treeId: string;
  leafId: string;
  deleteCase: DeleteCase;
  addEdgeList: Edge[];
  deleteEdgeList: Edge[];
  parentLeafId: string | null;
  childLeafIdList: string[];
};

export type UserInfo = {
  name: string;
  avatar?: string;
};
