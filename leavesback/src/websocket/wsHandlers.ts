import { WebSocket } from "ws";
import { IsConquer, Leaf, WsMessageType } from "../types";
import { leavesCollection, treesCollection } from "../config/db";
import { ObjectId } from "mongodb";

export const handleConnection = (ws: WebSocket, wsGroups: Map<string, Set<WebSocket>>) => {
  const messageHandler: Partial<Record<WsMessageType, (message: any) => void>> = {
    [WsMessageType.JOIN_LEAF]: (data) => {
      const { leafId, prevLeafId }: { leafId: string; prevLeafId: string | null } = data;
      //새로운 그룹 참가 전, 기존의 그룹에서 삭제.
      if (prevLeafId && wsGroups.has(prevLeafId)) {
        const prevGroup = wsGroups.get(prevLeafId);
        prevGroup?.delete(ws);
        if (prevGroup && prevGroup.size === 0) {
          wsGroups.delete(prevLeafId);
        }
      }
      if (!wsGroups.has(leafId)) wsGroups.set(leafId, new Set());
      wsGroups.get(leafId)?.add(ws);
      console.log(`success to join leafgroup: ${leafId}`);
    },
    [WsMessageType.UPDATE_LEAF_TITLE]: async (data) => {
      const { owningTreeId, leafId, title }: { owningTreeId: string; leafId: string; title: string } = data;
      console.log("[wsHandlers][updateLeafTitle]owningTreeId:", owningTreeId);
      try {
        //리프 문서 업데이트.
        const updateLeafResult = await leavesCollection.updateOne(
          { _id: new ObjectId(leafId) },
          { $set: { title } }
        );
        if (updateLeafResult.modifiedCount === 0) {
          console.log("[wsHandlers][updateLeafTitle]update leaf document error");
          throw new Error("No leaf document updated.");
        }
        //리프 그룹 브로드 캐스트.
        const leafClients = wsGroups.get(leafId);
        if (leafClients) {
          leafClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_LEAF_TITLE,
                  data: { leafId, title }
                })
              );
            }
          });
        }
        //트리 문서 업데이트.
        const updateTreeResult = await treesCollection.updateOne(
          { _id: new ObjectId(owningTreeId), "nodes.data.id": leafId },
          { $set: { "nodes.$.data.label": title } }
        )
        if (updateTreeResult.modifiedCount === 0) {
          console.log("[wsHandlers][updateLeafTitle]update tree document error");
          throw new Error("No tree document updated.");
        }
        //트리 그룹 브로드 캐스트.
        const treeClients = wsGroups.get(owningTreeId);
        if (treeClients) {
          treeClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              console.log("[wsHandlers]send to treeClients");
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_TREE_LABEL,
                  data: { treeId: owningTreeId, leafId, title }
                })
              );
            }
          });
        }
      } catch (error) {
        console.error("[wsHandlers] Failed to update leaf title:", error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: WsMessageType.UPDATE_LEAF_TITLE_ERROR,
              data: { message: "Failed to update leaf title", error }
            })
          );
        }
      }
    },
    [WsMessageType.JOIN_TREE]: (data) => {
      const { treeId, prevTreeId }: { treeId: string; prevTreeId: string | null } = data;
      //새로운 그룹 참가 전, 기존의 그룹에서 삭제.
      if (prevTreeId && wsGroups.has(prevTreeId)) {
        const prevGroup = wsGroups.get(prevTreeId);
        prevGroup?.delete(ws);
        if (prevGroup && prevGroup.size === 0) {
          wsGroups.delete(prevTreeId);
        }
      }
      if (!wsGroups.has(treeId)) wsGroups.set(treeId, new Set());
      wsGroups.get(treeId)?.add(ws);
      console.log(`success to join treegroup: ${treeId}`);
    },
    [WsMessageType.ADD_CHILD_LEAF]: async (data) => {
      const { leafId, owningTreeId, title }: { leafId: string; owningTreeId: string; title: string; } = data;
      const newLeaf: Leaf = {
        parentLeafId: leafId,
        owningTreeId,
        title,
        contents: "",
      }
      try {
        const insertLeafResult = await leavesCollection.insertOne(newLeaf);
        if (!insertLeafResult.acknowledged) {
          console.error("[wsHandlers][ADD_LEAF] Failed to insert new leaf");
          ws.send(JSON.stringify({ type: "ERROR", message: "Failed to insert new leaf." }));
          return;
        }
        const childLeafId = insertLeafResult.insertedId.toString();
        const newNode = { data: { id: childLeafId, label: title, isConquer: IsConquer.FALSE } };
        const newEdge = { data: { source: leafId, target: childLeafId } }
        const updateTreeResult = await treesCollection.updateOne(
          { _id: new ObjectId(owningTreeId) },
          {
            $push: {
              nodes: newNode,
              edges: newEdge
            }
          }
        );
        if (updateTreeResult.modifiedCount === 0) {
          console.error("[wsHandlers][ADD_LEAF] Failed to update tree with new node and edge");
          ws.send(JSON.stringify({ type: "ERROR", message: "Failed to update tree with new node and edge." }));
          return;
        }
        //트리 그룹 브로드 캐스트.
        const treeClients = wsGroups.get(owningTreeId);
        if (treeClients) {
          treeClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_TREE_ADD_CHILD_LEAF,
                  data: { treeId: owningTreeId, fromNodeId: leafId, newNode, newEdge }
                })
              );
            }
          });
        }
      } catch (error) {
        console.error("[wsHandlers][ADD_LEAF] Unexpected error:", error);
        ws.send(JSON.stringify({ type: "ERROR", message: "Unexpected error occurred while adding leaf." }));
      }
    },
    [WsMessageType.ADD_PARENT_LEAF]: async (data) => {
      const { leafId, owningTreeId, title, parentLeafId }: { leafId: string; owningTreeId: string; title: string; parentLeafId: string | null } = data;
      let deleteEdge: any = null;
      const newEdgeList: any[] = [];
      const newLeaf: Leaf = {
        parentLeafId,
        owningTreeId,
        title,
        contents: "",
      }
      try {
        //리프 문서 삽입.
        const insertLeafResult = await leavesCollection.insertOne(newLeaf);
        if (!insertLeafResult.acknowledged) {
          console.error("[wsHandlers][ADD_LEAF] Failed to insert new leaf");
          ws.send(JSON.stringify({ type: "ERROR", message: "Failed to insert new leaf." }));
          return;
        }
        //리프 문서 업데이트.
        const newLeafId = insertLeafResult.insertedId.toString();
        const updateLeafResult = await leavesCollection.updateOne(
          { _id: new ObjectId(leafId) },
          { $set: { parentLeafId: newLeafId } }
        )
        if (updateLeafResult.modifiedCount === 0) {
          console.error("[wsHandlers][ADD_LEAF] Failed to update parentLeafId in leaf document");
          ws.send(JSON.stringify({ type: "ERROR", message: "Failed to update parentLeafId in leaf document." }));
          return;
        }
        //트리 문서 업데이트.
        const newNode = { data: { id: newLeafId, label: title, isConquer: IsConquer.FALSE } };
        let updateTreeResult;
        if (parentLeafId) {
          const newEdge1 = { data: { source: parentLeafId, target: newLeafId } };
          const newEdge2 = { data: { source: newLeafId, target: leafId } }
          deleteEdge = { data: { source: parentLeafId, target: leafId } }
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
                    newEdge2 // 새로운 노드 -> 현재 노드 엣지 추가
                  ]
                }
              }
            }
          );
          newEdgeList.push(newEdge1, newEdge2);
        } else {
          const newEdge = { data: { source: newLeafId, target: leafId } }
          updateTreeResult = await treesCollection.updateOne(
            { _id: new ObjectId(owningTreeId) },
            {
              $push: {
                nodes: newNode,
                edges: newEdge
              }
            }
          );
          newEdgeList.push(newEdge);
        }
        if (!updateTreeResult) {
          console.error("[wsHandlers][ADD_PARENT_LEAF] Failed to update tree with new node and edge");
          ws.send(JSON.stringify({ type: "ERROR", message: "Failed to update tree with new node and edge." }));
          return;
        }
        //트리 그룹 브로드 캐스트.
        const treeClients = wsGroups.get(owningTreeId);
        if (treeClients) {
          treeClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_TREE_ADD_PARENT_LEAF,
                  data: { treeId: owningTreeId, fromNodeId: leafId, newNode, deleteEdge, newEdgeList }
                })
              );
            }
          });
        }
        //리프 그룹 브로드 캐스트.
        const leafClients = wsGroups.get(leafId);
        if (leafClients) {
          leafClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_LEAF_PARENT,
                  data: { leafId, parentLeafId: newLeafId }
                })
              );
            }
          });
        }
      } catch (error) {
        console.error("[wsHandlers][ADD_PARENT_LEAF] Unexpected error:", error);
        ws.send(JSON.stringify({ type: "ERROR", message: "Unexpected error occurred while adding parent leaf." }));
      }
    },
    [WsMessageType.UPDATE_TREE_CONQUER]: async (data) => {
      const { treeId, leafId, isConquer }: { treeId: string, leafId: string, isConquer: IsConquer } = data;
      const newIsConquer = isConquer === IsConquer.FALSE ? IsConquer.TRUE : IsConquer.FALSE;
      //트리 문서 업데이트
      try {
        const resultDocument = await treesCollection.findOneAndUpdate(
          { _id: new ObjectId(treeId), "nodes.data.id": leafId }, // 특정 treeId 문서에서 nodes 배열 내 leafId 찾기
          {
            $set: {
              "nodes.$.data.isConquer": newIsConquer
            },
          },
          { returnDocument: "after", projection: { nodes: 1, _id: 0 } } // 업데이트된 nodes만 반환
        );

        if (!resultDocument) {
          throw new Error(`Node with id ${leafId} not found in tree ${treeId}`);
        }
        //트리 그룹 브로드 캐스트.
        const treeClients = wsGroups.get(treeId);
        if (treeClients) {
          treeClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: WsMessageType.UPDATE_TREE_CONQUER,
                  data: { treeId, targetNodeId: leafId, newIsConquer }
                })
              );
            }
          });
        }
      } catch (error) {
        console.error("Error updating isConquer field:", error);
      }
    }
  }
  ws.on("message", (rawData) => {
    const message = JSON.parse(rawData.toString());
    const type: WsMessageType = message.type;
    const data = message.data;
    if (messageHandler[type]) {
      messageHandler[type](data);
    }
  })
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    wsGroups.forEach((value, key) => {
      value.delete(ws);
      if (value.size === 0) wsGroups.delete(key);
    });
  });
};
