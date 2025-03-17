import { WebSocket, WebSocketServer } from "ws";

export const handleConnection = (ws: WebSocket, wss: WebSocketServer) => {
  ws.send("Welcome to the WebSocket server!"); //클라이언트의 ws.onmessage 핸들러가 실행
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
};
