import { v4 as uuid } from "uuid";

import { Socket } from "../../units";
import { NoSocketError } from "../../errors";
import { WebSocket } from "ws";

export class SocketManager {
  private sockets: Map<string, Socket> = new Map();

  public constructor() { }

  public openSocket(ws: WebSocket) {
    const socketId = uuid();
    const socket = new Socket(socketId, ws);

    this.sockets.set(socketId, socket);

    return { socketId, socket };
  }

  public closeSocket(socketId: string) {
    this.sockets.delete(socketId);
  }

  public getSocket(socketId: string) {
    const socket = this.sockets.get(socketId);

    if (!socket) {
      throw new NoSocketError(socketId);
    }

    return socket;
  }
}
