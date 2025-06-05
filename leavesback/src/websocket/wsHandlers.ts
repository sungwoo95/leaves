import { WebSocket } from 'ws';
import {
  DeleteCase,
  DeleteLeafData,
  Directory,
  DirectoryType,
  IsConquer,
  Leaf,
  updateForestDirectoriesData,
  WsMessageType,
} from '../types';
import {
  forestsCollection,
  leavesCollection,
  treesCollection,
  usersCollection,
} from '../config/db';
import { ObjectId } from 'mongodb';
import liveblocks from '../liveblocks';

async function deleteAllRooms() {
  while (true) {
    const roomsPage = await liveblocks.getRooms();
    const rooms = roomsPage.data;

    if (rooms.length === 0) {
      break; // 더 이상 삭제할 room이 없음
    }

    for (const room of rooms) {
      await liveblocks.deleteRoom(room.id);
    }
  }
}

const deleteLeaf = async (targetId: string) => {
  const leafDelRes = await leavesCollection.deleteOne({
    _id: new ObjectId(targetId),
  });
  if (!leafDelRes.acknowledged || leafDelRes.deletedCount === 0) {
    throw new Error(`[DeleteCase.HAS_PARENT] Failed to delete leaf`)
  }
  await liveblocks.deleteRoom(targetId);
}

const deleteTree = async (deleteTreeId: string) => {
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

const deleteTreeFromDirectories = async (
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

export const registHandler = (
  ws: WebSocket,
  wsGroups: Map<string, Set<WebSocket>>
) => {
  const leaveWsGroup = (groupId: string) => {
    const group = wsGroups.get(groupId);
    if (group) {
      group.delete(ws);
      if (group.size === 0) {
        wsGroups.delete(groupId);
      }
    }
  };
  const joinWsGroup = (groupId: string) => {
    if (!wsGroups.has(groupId)) wsGroups.set(groupId, new Set());
    wsGroups.get(groupId)?.add(ws);
  };
  const broadCast = (
    groupId: string,
    messageType: WsMessageType,
    data: any,
    exceptWs?: any
  ) => {
    const clients = wsGroups.get(groupId);
    if (!clients) return;
    clients.forEach((client) => {
      if (client !== exceptWs && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: messageType, data }));
      }
    });
  };

  const messageHandler: Partial<Record<WsMessageType, (message: any) => void>> =
  {
    [WsMessageType.UPDATE_LEAF_TITLE]: async (data) => {
      const {
        owningTreeId,
        leafId,
        title,
      }: { owningTreeId: string; leafId: string; title: string } = data;
      console.log('[wsHandlers][updateLeafTitle]owningTreeId:', owningTreeId);
      try {
        //리프 문서 업데이트.
        const updateLeafResult = await leavesCollection.updateOne(
          { _id: new ObjectId(leafId) },
          { $set: { title } }
        );
        if (updateLeafResult.matchedCount === 0) {
          console.log(
            '[wsHandlers][updateLeafTitle]update leaf document error'
          );
          throw new Error('No leaf document matched');
        }
        //리프 그룹 브로드 캐스트.
        const leafClients = wsGroups.get(leafId);
        if (leafClients) {
          leafClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_LEAF_TITLE,
                  data: { leafId, title },
                })
              );
            }
          });
        }
        //트리 문서 업데이트.
        const updateTreeResult = await treesCollection.updateOne(
          { _id: new ObjectId(owningTreeId), 'nodes.data.id': leafId },
          { $set: { 'nodes.$.data.label': title } }
        );
        if (updateTreeResult.modifiedCount === 0) {
          console.log(
            '[wsHandlers][updateLeafTitle]update tree document error'
          );
          throw new Error('No tree document updated.');
        }
        //트리 그룹 브로드 캐스트.
        const treeClients = wsGroups.get(owningTreeId);
        if (treeClients) {
          treeClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              console.log('[wsHandlers]send to treeClients');
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_TREE_LABEL,
                  data: { treeId: owningTreeId, leafId, title },
                })
              );
            }
          });
        }
      } catch (error) {
        console.error('[wsHandlers] Failed to update leaf title:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: WsMessageType.UPDATE_LEAF_TITLE_ERROR,
              data: { message: 'Failed to update leaf title', error },
            })
          );
        }
      }
    },
    [WsMessageType.ADD_CHILD_LEAF]: async (data) => {
      const {
        leafId,
        owningTreeId,
        title,
        forestId,
      }: { leafId: string; owningTreeId: string; title: string; forestId: string } = data;
      const newLeaf: Leaf = {
        forestId,
        parentLeafId: leafId,
        owningTreeId,
        title,
        contents: '',
      };
      try {
        const insertLeafResult = await leavesCollection.insertOne(newLeaf);
        if (!insertLeafResult.acknowledged) {
          console.error('[wsHandlers][ADD_LEAF] Failed to insert new leaf');
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              message: 'Failed to insert new leaf.',
            })
          );
          return;
        }
        const childLeafId = insertLeafResult.insertedId.toString();
        const newNode = {
          data: { id: childLeafId, label: title, isConquer: IsConquer.FALSE },
        };
        const newEdge = { data: { source: leafId, target: childLeafId } };
        const updateTreeResult = await treesCollection.updateOne(
          { _id: new ObjectId(owningTreeId) },
          {
            $push: {
              nodes: newNode,
              edges: newEdge,
            },
          }
        );
        if (updateTreeResult.modifiedCount === 0) {
          console.error(
            '[wsHandlers][ADD_LEAF] Failed to update tree with new node and edge'
          );
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              message: 'Failed to update tree with new node and edge.',
            })
          );
          return;
        }
        //트리 그룹 브로드 캐스트.
        const treeClients = wsGroups.get(owningTreeId);
        if (treeClients) {
          treeClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_TREE_ADD_CHILD_LEAF,
                  data: {
                    treeId: owningTreeId,
                    fromNodeId: leafId,
                    newNode,
                    newEdge,
                  },
                })
              );
            }
          });
        }
      } catch (error) {
        console.error('[wsHandlers][ADD_LEAF] Unexpected error:', error);
        ws.send(
          JSON.stringify({
            type: 'ERROR',
            message: 'Unexpected error occurred while adding leaf.',
          })
        );
      }
    },
    [WsMessageType.ADD_PARENT_LEAF]: async (data) => {
      const {
        leafId,
        owningTreeId,
        title,
        parentLeafId,
        forestId,
      }: {
        leafId: string;
        owningTreeId: string;
        title: string;
        parentLeafId: string | null;
        forestId: string;
      } = data;
      let deleteEdge: any = null;
      const newEdgeList: any[] = [];
      const newLeaf: Leaf = {
        forestId,
        parentLeafId,
        owningTreeId,
        title,
        contents: '',
      };
      try {
        //리프 문서 삽입.
        const insertLeafResult = await leavesCollection.insertOne(newLeaf);
        if (!insertLeafResult.acknowledged) {
          console.error('[wsHandlers][ADD_LEAF] Failed to insert new leaf');
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              message: 'Failed to insert new leaf.',
            })
          );
          return;
        }
        //리프 문서 업데이트.
        const newLeafId = insertLeafResult.insertedId.toString();
        const updateLeafResult = await leavesCollection.updateOne(
          { _id: new ObjectId(leafId) },
          { $set: { parentLeafId: newLeafId } }
        );
        if (updateLeafResult.modifiedCount === 0) {
          console.error(
            '[wsHandlers][ADD_LEAF] Failed to update parentLeafId in leaf document'
          );
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              message: 'Failed to update parentLeafId in leaf document.',
            })
          );
          return;
        }
        //트리 문서 업데이트.
        const newNode = {
          data: { id: newLeafId, label: title, isConquer: IsConquer.FALSE },
        };
        let updateTreeResult;
        if (parentLeafId) {
          const newEdge1 = {
            data: { source: parentLeafId, target: newLeafId },
          };
          const newEdge2 = { data: { source: newLeafId, target: leafId } };
          deleteEdge = { data: { source: parentLeafId, target: leafId } };
          await treesCollection.updateOne(
            { _id: new ObjectId(owningTreeId) },
            { $pull: { edges: deleteEdge } } // 기존 엣지 삭제
          );
          updateTreeResult = await treesCollection.updateOne(
            { _id: new ObjectId(owningTreeId) },
            {
              $push: {
                nodes: newNode, // 새로운 노드 추가
                edges: {
                  $each: [
                    newEdge1, // 부모 노드 -> 새로운 노드 엣지 추가
                    newEdge2, // 새로운 노드 -> 현재 노드 엣지 추가
                  ],
                },
              },
            }
          );
          newEdgeList.push(newEdge1, newEdge2);
        } else {
          const newEdge = { data: { source: newLeafId, target: leafId } };
          updateTreeResult = await treesCollection.updateOne(
            { _id: new ObjectId(owningTreeId) },
            {
              $push: {
                nodes: newNode,
                edges: newEdge,
              },
            }
          );
          newEdgeList.push(newEdge);
        }
        if (!updateTreeResult) {
          console.error(
            '[wsHandlers][ADD_PARENT_LEAF] Failed to update tree with new node and edge'
          );
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              message: 'Failed to update tree with new node and edge.',
            })
          );
          return;
        }
        //트리 그룹 브로드 캐스트.
        const treeClients = wsGroups.get(owningTreeId);
        if (treeClients) {
          treeClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_TREE_ADD_PARENT_LEAF,
                  data: {
                    treeId: owningTreeId,
                    fromNodeId: leafId,
                    newNode,
                    deleteEdge,
                    newEdgeList,
                  },
                })
              );
            }
          });
        }
        //리프 그룹 브로드 캐스트.
        const leafClients = wsGroups.get(leafId);
        if (leafClients) {
          leafClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_LEAF_PARENT,
                  data: { leafId, parentLeafId: newLeafId },
                })
              );
            }
          });
        }
      } catch (error) {
        console.error(
          '[wsHandlers][ADD_PARENT_LEAF] Unexpected error:',
          error
        );
        ws.send(
          JSON.stringify({
            type: 'ERROR',
            message: 'Unexpected error occurred while adding parent leaf.',
          })
        );
      }
    },
    [WsMessageType.UPDATE_TREE_CONQUER]: async (data) => {
      const {
        treeId,
        leafId,
        isConquer,
      }: { treeId: string; leafId: string; isConquer: IsConquer } = data;
      const newIsConquer =
        isConquer === IsConquer.FALSE ? IsConquer.TRUE : IsConquer.FALSE;
      //트리 문서 업데이트
      try {
        const resultDocument = await treesCollection.findOneAndUpdate(
          { _id: new ObjectId(treeId), 'nodes.data.id': leafId }, // 특정 treeId 문서에서 nodes 배열 내 leafId 찾기
          {
            $set: {
              'nodes.$.data.isConquer': newIsConquer,
            },
          },
          { returnDocument: 'after', projection: { nodes: 1, _id: 0 } } // 업데이트된 nodes만 반환
        );

        if (!resultDocument) {
          throw new Error(
            `Node with id ${leafId} not found in tree ${treeId}`
          );
        }
        //트리 그룹 브로드 캐스트.
        const treeClients = wsGroups.get(treeId);
        if (treeClients) {
          treeClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_TREE_CONQUER,
                  data: { treeId, targetNodeId: leafId, newIsConquer },
                })
              );
            }
          });
        }
      } catch (error) {
        console.error('Error updating isConquer field:', error);
      }
    },
    [WsMessageType.JOIN_GROUP]: (data) => {
      const {
        groupId,
        prevGroupId,
      }: { groupId: string; prevGroupId: string | null } = data;
      if (prevGroupId) {
        leaveWsGroup(prevGroupId);
      }
      joinWsGroup(groupId);
    },
    [WsMessageType.UPDATE_FOREST_DIRECTORIES]: async (data: updateForestDirectoriesData) => {
      const {
        forestId,
        directories,
        deleteInfo
      } = data;
      try {
        const deleteTreeId = deleteInfo?.deleteTreeId;
        const deleteDirectories = deleteInfo?.deleteDirectories;
        let deleteTreeIds = null;
        //forest문서 업데이트.
        const result = await forestsCollection.updateOne(
          { _id: new ObjectId(forestId) },
          { $set: { directories: directories } }
        );
        if (result.matchedCount === 0) {
          throw new Error('No forest document matched');
        }
        //트리 삭제.
        if (deleteTreeId) {
          deleteTree(deleteTreeId);
          deleteTreeIds = [deleteTreeId]
        }
        if (deleteDirectories) {
          deleteTreeIds = await deleteTreeFromDirectories(deleteDirectories)
        }
        //forest브로드 캐스트
        const forestClients = wsGroups.get(forestId);
        if (forestClients) {
          forestClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_FOREST_DIRECTORIES,
                  data: { forestId, directories, deleteTreeIds },
                })
              );
            }
          });
        }
      } catch (error) {
        console.error(
          '[WsHandlers][UPDATE_FOREST_DIRECTORIES]',
          error
        );
      }
    },
    [WsMessageType.LEAVE_GROUP]: (data) => {
      const { groupId }: { groupId: string } = data;
      leaveWsGroup(groupId);
    },
    [WsMessageType.DELETE_LEAF]: async (data: DeleteLeafData) => {
      const {
        treeId,
        leafId,
        deleteCase,
        addEdgeList,
        deleteEdgeList,
        parentLeafId,
        childLeafIdList,
      } = data;
      const broadCastToTreeData = {
        treeId,
        leafId,
      };
      const broadCastToLeafData = {
        leafId,
        isEmptyLeaf: false,
      };
      try {
        switch (deleteCase) {
          case DeleteCase.CHANGE_TO_EMPTY_LEAF: {
            broadCastToLeafData.isEmptyLeaf = true;

            // 리프 문서 수정
            const leafUpdateRes = await leavesCollection.updateOne(
              { _id: new ObjectId(leafId) },
              { $set: { title: 'Empty Leaf', contents: '' } }
            );
            if (!leafUpdateRes.acknowledged) {
              console.error(
                `[DeleteCase.CHANGE_TO_EMPTY_LEAF] Failed to find leaf ${leafId}:\n`,
                leafUpdateRes
              );
            }

            // 트리 문서 수정
            const treeUpdateRes1 = await treesCollection.updateOne(
              { _id: new ObjectId(treeId), 'nodes.data.id': leafId },
              {
                $set: {
                  'nodes.$.data.label': 'Empty Leaf',
                  'nodes.$.data.isConquer': IsConquer.FALSE,
                },
              }
            );
            if (!treeUpdateRes1.acknowledged) {
              console.error(
                `[DeleteCase.CHANGE_TO_EMPTY_LEAF] Failed to find tree node ${leafId}`,
                treeUpdateRes1
              );
            }
            break;
          }

          case DeleteCase.HAS_PARENT: {
            // 리프 삭제
            deleteLeaf(leafId);
            // 노드 삭제
            const pullNodeRes = await treesCollection.updateOne(
              { _id: new ObjectId(treeId) },
              { $pull: { nodes: { 'data.id': leafId } } } as any
            );
            if (!pullNodeRes.acknowledged) {
              console.error(
                `[DeleteCase.HAS_PARENT] $pull nodes failed for ${leafId}`,
                pullNodeRes
              );
            }
            // 엣지 삭제
            const pullEdgeRes = await treesCollection.updateOne(
              { _id: new ObjectId(treeId) },
              { $pull: { edges: { $or: deleteEdgeList } } } as any
            );
            if (!pullEdgeRes.acknowledged) {
              console.error(
                `[DeleteCase.HAS_PARENT] $pull edges failed for ${leafId}`,
                pullEdgeRes
              );
            }
            // 엣지 추가
            const pushEdgeRes = await treesCollection.updateOne(
              { _id: new ObjectId(treeId) },
              { $push: { edges: { $each: addEdgeList } } }
            );
            if (!pushEdgeRes.acknowledged) {
              console.error(
                `[DeleteCase.HAS_PARENT] $push edges failed for ${leafId}`,
                pushEdgeRes
              );
            }
            // 리프의 parentLeafId 변경
            for (const childId of childLeafIdList) {
              const updateLeafRes = await leavesCollection.updateOne(
                { _id: new ObjectId(childId) },
                { $set: { parentLeafId: parentLeafId } }
              );

              if (
                !updateLeafRes.acknowledged ||
                updateLeafRes.modifiedCount === 0
              ) {
                console.error(
                  `[DeleteCase.HAS_PARENT] update parentLeafId failed for ${childId}`
                );
              }
            }
            break;
          }

          case DeleteCase.ROOT_WITH_SINGLE_CHILD:
            {
              deleteLeaf(leafId);
              // 노드 삭제
              const pullNodeRes2 = await treesCollection.updateOne(
                { _id: new ObjectId(treeId) },
                { $pull: { nodes: { 'data.id': leafId } } } as any
              );
              if (!pullNodeRes2.acknowledged) {
                console.error(
                  `[DeleteCase.ROOT_WITH_SINGLE_CHILD] $pull nodes failed for ${leafId}`,
                  pullNodeRes2
                );
              }

              // 엣지 삭제
              const pullEdgeRes2 = await treesCollection.updateOne(
                { _id: new ObjectId(treeId) },
                { $pull: { edges: { $or: deleteEdgeList } } } as any
              );
              if (!pullEdgeRes2.acknowledged) {
                console.error(
                  `[DeleteCase.ROOT_WITH_SINGLE_CHILD] $pull edges failed for ${leafId}`,
                  pullEdgeRes2
                );
              }
              // 리프의 parentLeafId 변경
              const childId = childLeafIdList[0];
              const updateParentLeafRes = await leavesCollection.updateOne(
                { _id: new ObjectId(childId) },
                { $set: { parentLeafId: parentLeafId } }
              );

              if (!updateParentLeafRes.acknowledged) {
                console.error(
                  `[DeleteCase.ROOT_WITH_SINGLE_CHILD] update ParentLeafId failed for ${childId}`,
                  updateParentLeafRes
                );
              }
            }
            break;
        }

        // 브로드 캐스트.
        broadCast(
          treeId,
          WsMessageType.UPDATE_TREE_DELETE_LEAF,
          broadCastToTreeData,
          ws
        );
        broadCast(
          leafId,
          WsMessageType.UPDATE_LEAF_DELETE_LEAF,
          broadCastToLeafData
        );
        if (deleteCase !== DeleteCase.CHANGE_TO_EMPTY_LEAF) {
          childLeafIdList.forEach((leafId) => {
            const updateLeafParentData = {
              leafId,
              parentLeafId,
            };
            broadCast(
              leafId,
              WsMessageType.UPDATE_LEAF_PARENT,
              updateLeafParentData
            );
          });
        }
      } catch (error) {
        console.error('[wsHandlers][DELETE_LEAF] Error:', error);
        // if (ws.readyState === WebSocket.OPEN) {
        //   ws.send(JSON.stringify({ type: WsMessageType.DELETE_LEAF_ERROR, data: { message: "Failed to delete leaf", error } }));
        // }
      }
    },
    [WsMessageType.UPDATE_FOREST_NAME]: async (data) => {
      const {
        forestId,
        newName,
      }: { forestId: string; newName: string } = data;
      try {
        //forest문서 업데이트.
        const result = await forestsCollection.updateOne(
          { _id: new ObjectId(forestId) },
          { $set: { name: newName } }
        );
        if (result.matchedCount === 0) {
          throw new Error('No forest document matched');
        }
        //브로드 캐스트
        const sendData = { forestId, newName }
        broadCast(forestId, WsMessageType.UPDATE_FOREST_NAME, sendData, ws)
      } catch (error) {
        console.error(
          '[WsHandlers][UPDATE_FOREST_NAME] error: ',
          error
        );
      }
    },
    [WsMessageType.DELETE_FOREST]: async (data) => {
      const { forestId }: { forestId: string; } = data;
      const forestObjectId = new ObjectId(forestId);
      try {
        // Forest 문서 조회
        const forest = await forestsCollection.findOne({ _id: forestObjectId });
        if (!forest) {
          throw new Error('Forest not found');
        }
        // Forest 문서 삭제
        const result = await forestsCollection.deleteOne({ _id: forestObjectId });
        if (result.deletedCount === 0) {
          throw new Error('Failed to delete forest');
        }
        //directories 소속 tree제거.
        deleteTreeFromDirectories(forest.directories);
        // Forest 참가자들의 User 문서 업데이트
        for (const participantSub of forest.participants) {
          await usersCollection.updateOne(
            { sub: participantSub },
            {
              $pull: {
                myForests: { forestId },
              },
            }
          );
        }
        // 브로드캐스트
        broadCast(forestId, WsMessageType.DELETE_FOREST, { forestId }, ws);
      } catch (error) {
        console.error('[WsHandlers][DELETE_FOREST]', error);
      }
    },
    [WsMessageType.LEAVE_FOREST]: async (data) => {
      const { forestId, sub }: { forestId: string; sub: string } = data;
      const forestObjectId = new ObjectId(forestId);
      try {
        await usersCollection.updateOne(
          { sub },
          {
            $pull: {
              myForests: { forestId },
            },
          }
        );
        await forestsCollection.updateOne(
          { _id: forestObjectId },
          {
            $pull: {
              participants: sub,
            },
          }
        );
        broadCast(forestId, WsMessageType.LEAVE_FOREST, { forestId, sub }, ws);
      } catch (error) {
        console.error('[WsHandlers][LEAVE_FOREST]', error);
      }
    }
  };

  ws.on('message', (rawData) => {
    const message = JSON.parse(rawData.toString());
    const type: WsMessageType = message.type;
    const data = message.data;
    if (messageHandler[type]) {
      messageHandler[type](data);
    }
  });
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    wsGroups.forEach((value, key) => {
      value.delete(ws);
      if (value.size === 0) wsGroups.delete(key);
    });
  });
};
