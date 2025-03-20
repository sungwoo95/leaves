import { WebSocket } from "ws";
import { WsMessageType } from "../types";
import { leavesCollection } from "../config/db";
import { ObjectId } from "mongodb";

export const handleConnection = (ws: WebSocket, wsGroups: Map<string, Set<WebSocket>>) => {
  const messageHandler: Partial<Record<WsMessageType, (message: any) => void>> = {
    [WsMessageType.JOIN_LEAF]: (data) => {
      const leafId: string = data.leafId;
      if (!wsGroups.has(leafId)) wsGroups.set(leafId, new Set());
      wsGroups.get(leafId)?.add(ws);
      console.log(`success to join ${leafId}`);
    },
    [WsMessageType.UPDATE_LEAF_TITLE]: async (data) => {
      const leafId: string = data.leafId;
      const title: string = data.title;
      console.log("[wsHandlers][updateTitle]title: ", title);
      try {
        const result = await leavesCollection.updateOne(
          { _id: new ObjectId(leafId) },
          { $set: { title } }
        );
        if (result.modifiedCount === 0) {
          throw new Error("No document updated. LeafId may be incorrect.");
        }
        const clients = wsGroups.get(leafId);
        if (clients) {
          clients.forEach(client => {
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
