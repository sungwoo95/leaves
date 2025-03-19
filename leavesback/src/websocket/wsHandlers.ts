import { WebSocket } from "ws";
import { WsMessageType } from "../types";

export const handleConnection = (ws: WebSocket, wsGroups: Map<string, Set<WebSocket>>) => {
  const messageHandler: Record<WsMessageType, (message: any) => void> = {
    [WsMessageType.JOIN_Leaf]: (data) => {
      const leafId: string = data.leafId;
      if (!wsGroups.has(leafId)) wsGroups.set(leafId, new Set());
      wsGroups.get(leafId)?.add(ws);
      console.log(`success to join ${leafId}`);
    },
  }
  ws.on("message", (rawData) => {
    const message = JSON.parse(rawData.toString());
    const type: WsMessageType = message.type;
    const data = message.data;
    messageHandler[type](data);
  })
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    wsGroups.forEach((value, key) => {
      value.delete(ws);
      if (value.size === 0) wsGroups.delete(key);
    });
  });
};
