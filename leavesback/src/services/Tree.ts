import { ObjectId } from "mongodb";
import { treesCollection } from "../config/db";
import { deleteLeaf } from "./Leaf";
import { Directory, DirectoryType } from "../types";

export const deleteTree = async (deleteTreeId: string) => {
  const tree = await treesCollection.findOneAndDelete({
    _id: new ObjectId(deleteTreeId),
  })
  if (!tree) {
    throw new Error('Tree of deleteTreeId not found');
  }
  for (const node of tree.nodes) {
    const nodeId = node.data.id;
    await deleteLeaf(nodeId);
  }
}

export const deleteTreeFromDirectories = async (
  directories: Directory[] // 삭제 대상이 될 디렉토리 배열
): Promise<string[]> => {  // 삭제한 treeId들을 배열로 반환
  const deletedTreeIds: string[] = []; // 삭제된 treeId를 저장할 배열

  // 디렉토리 트리를 순회하며 삭제 처리하는 재귀 함수
  const traverse = async (dir: Directory) => {
    // 현재 노드가 파일 타입이고 treeId가 존재하면 삭제
    if (dir.type === DirectoryType.FILE && dir.treeId) {
      await deleteTree(dir.treeId);  // 외부 deleteTree 함수 직접 호출
      deletedTreeIds.push(dir.treeId);  // 삭제된 treeId 배열에 추가
    }

    // 자식 디렉토리들도 재귀적으로 순회
    for (const child of dir.children) {
      await traverse(child);
    }
  };

  // 최상위 directories 배열을 순회하며 traverse 호출
  for (const directory of directories) {
    await traverse(directory);
  }

  return deletedTreeIds; // 삭제 완료한 모든 treeId 반환
};