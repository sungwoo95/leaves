import { WebSocket } from "ws";
import { WsMessageType } from "../types";
import { leavesCollection, treesCollection } from "../config/db";
import { ObjectId } from "mongodb";

export const handleConnection = (ws: WebSocket, wsGroups: Map<string, Set<WebSocket>>) => {
  const messageHandler: Partial<Record<WsMessageType, (message: any) => void>> = {
    [WsMessageType.JOIN_LEAF]: (data) => {
      const leafId: string = data.leafId;
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
            if (client.readyState === WebSocket.OPEN) {
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
                  type: WsMessageType.UPDATE_LEAF_TITLE,
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
      const treeId: string = data.treeId;
      if (!wsGroups.has(treeId)) wsGroups.set(treeId, new Set());
      wsGroups.get(treeId)?.add(ws);
      console.log(`success to join treegroup: ${treeId}`);
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
