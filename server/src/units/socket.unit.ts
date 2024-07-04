import { WebSocket } from "ws";

import { SocketDocOpenError } from "../errors";
import { User } from "../units";

export class Socket {
  private openDocId?: string;

  public constructor(private socketId: string, private ws: WebSocket, private user?: User) { }

  public getId() {
    return this.socketId;
  }

  public getUser() {
    return this.user;
  }

  public setUser(user: User) {
    if (!this.user) {
      this.user = user;
    }
  }

  public getOpenDocId() {
    return this.openDocId;
  }

  public send(asction: string, payload: any) {
    this.ws.send(this.createActionResponse(asction, payload));
  }

  public openDoc(docId: string) {
    if (this.openDocId) {
      throw new SocketDocOpenError(this.socketId);
    }

    this.openDocId = docId;
  }

  public closeDoc() {
    this.openDocId = undefined;
  }

  public isClosed() {
    return this.ws.readyState === this.ws.CLOSED;
  }

  private createActionResponse(action: string, payload: any) {
    return JSON.stringify([action, payload]);
  }
}
