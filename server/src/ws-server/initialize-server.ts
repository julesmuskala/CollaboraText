import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";

import { DocManager, AuthManager, SocketManager } from "../managers";
import { Handler } from "./handler";
import { logInfo } from "../utils/log";

interface InitializeServerParams {
  port: number;
  docManager: DocManager;
  authManager: AuthManager;
}

export const initializeServer = ({ port, docManager, authManager }: InitializeServerParams) => {
  const server = createServer();
  const wsServer = new WebSocketServer({ port });

  const socketManager = new SocketManager();

  wsServer.on("connection", (ws: WebSocket) => {
    const { socketId, socket } = socketManager.openSocket(ws);

    logInfo(`Socket ${socketId} opened.`);

    const handler = new Handler({
      socket,
      authManager,
      docManager,
      socketManager,
    });

    ws.on("message", (data) => handler.handleMessage(data));
    ws.on("close", () => handler.handleClose());

    ws.send(JSON.stringify(["ok", {}]));
  });

  logInfo(`🚀 Server up and running on port ${port}`);

  return server;
};
