import { WebSocket } from "ws";
import { WsMessageType } from "../types";

export const handleConnection = (ws: WebSocket, wsGroups: Map<string, Set<WebSocket>>) => {
  const messageHandler: Record<WsMessageType, (message: any) => void> = {
    [WsMessageType.JOIN_LEAF]: (data) => {
      const leafId: string = data.leafId;
      if (!wsGroups.has(leafId)) wsGroups.set(leafId, new Set());
      wsGroups.get(leafId)?.add(ws);
      console.log(`success to join ${leafId}`);
    },
    [WsMessageType.UPDATE_LEAF_TITLE]: async (data) => {
      //브로드 캐스트.
      //db에 저장.
      const leafId: string = data.leafId;
      const title: string = data.title;
      console.log("[wsHandlers][updateTitle]title: ", title);
      const clients = wsGroups.get(leafId)
      if (clients) {
        clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: WsMessageType.UPDATE_LEAF_TITLE, data: { leafId, title } }))
          }
        })
      }
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
