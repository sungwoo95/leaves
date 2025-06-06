import { WebSocket } from 'ws';
import { WsMessageType } from "../types";
import liveblocks from '../liveblocks';

export const wsGroups = new Map<string, Set<WebSocket>>();

export const broadCast = (
  groupId: string,
  messageType: WsMessageType,
  data: any,
  exceptWs?: WebSocket
) => {
  const clients = wsGroups.get(groupId);
  if (!clients) return;
  clients.forEach((client) => {
    if (client !== exceptWs && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: messageType, data }));
    }
  });
};

export const deleteAllRooms = async () => {
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

