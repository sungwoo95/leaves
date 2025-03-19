import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import treeRouter from "./routes/treeRouter";
import userRouter from "./routes/userRouter";
import { connectToMongoDB } from "./config/db";
import cookieParser from "cookie-parser";
import forestRouter from "./routes/forestRouter";
import { WebSocket, WebSocketServer } from "ws";
import { handleConnection } from "./websocket/wsHandlers";

const App = () => {
  const app: Application = express();
  const REST_API_PORT = 3001;
  const WS_PORT = 8081;
  const wsGroups = new Map<string, Set<WebSocket>>();

  const setUpExpress = () => {
    app.use(express.json());//req.body를 자동으로 객체로 변환
    app.use(cookieParser());
    app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
      })
    );
  }
  const setUpRestApiServer = () => {
    app.use("/api/tree", treeRouter);
    app.use("/api/user", userRouter);
    app.use("/api/forest", forestRouter);
  }
  const startRestApiServer = () => {
    setUpExpress();
    setUpRestApiServer();
    app.listen(REST_API_PORT, () => {
      console.log(`Server is running on port ${REST_API_PORT}`);
    });
  }
  const startWebSocketServer = () => {
    const wsServer: WebSocketServer = new WebSocket.Server({ port: WS_PORT });
    wsServer.on("connection", (ws: WebSocket) => { //ws매개변수의 인자값은 새로 연결된 클라이언트의 WebSocket 객체임.
      console.log("New WebSocket client connected");
      handleConnection(ws,wsGroups);
    });
    console.log(`WebSocket server running on port ${WS_PORT}`);
  };
  const connectToDB = async () => {
    try {
      await connectToMongoDB();
    } catch (err: unknown) {
      console.error("Failed to connect to db :", err);
    }
  };

  setUpExpress();
  startRestApiServer();
  startWebSocketServer();
  connectToDB();
}

App();

