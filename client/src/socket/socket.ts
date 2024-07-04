import { User } from "../user";
import { MessageAction } from "./message-action";

export class Socket {
  private static instance?: Socket;

  private static actionHandlers: Map<MessageAction, ((data: any) => void) | undefined> = new Map();

  private currentDocId?: string;

  private isOpen = false;

  private constructor(private webSocket = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL)) {
    this.webSocket.addEventListener("open", () => {
      this.isOpen = true;
    });

    this.webSocket.addEventListener("message", (event) => {
      const [action, data] = JSON.parse(event.data);

      const handler = Socket.actionHandlers.get(Socket.parseAction(action));

      if (handler) {
        handler(data);
      }
    });
  }

  public static getInstance() {
    if (!Socket.instance) {
      Socket.instance = new Socket();
    }

    return Socket.instance;
  }

  public send(action: MessageAction, data: any) {
    if (this.webSocket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not open!");
    }

    this.webSocket.send(JSON.stringify([action, data]));
  }

  public setActionHandler(action: MessageAction, handler: ((data: any) => void) | undefined) {
    Socket.actionHandlers.set(action, handler);
  }

  public setDoc(id: string) {
    if (this.currentDocId) {
      throw new Error(`Doc is already set to ${this.currentDocId}.`);
    }

    this.currentDocId = id;
  }

  public isOpened() {
    return this.isOpen;
  }

  public getDocId() {
    return this.currentDocId;
  }

  public authUser() {
    const user = User.getInstance();

    if (user.isAuthenticated() || !user.getToken()) return;

    user.setAuthenticated();
    this.send(MessageAction.AUTH_USER, { token: user.getToken() });
  }

  public on(action: MessageAction, f: (data: any) => void) {
    this.webSocket.addEventListener("message", (event) => {
      const [recievedAction, data] = JSON.parse(event.data);

      if (Socket.parseAction(recievedAction) !== action) {
        return;
      }

      f(data);
    });
  }

  public off(f: (data: any) => void) {
    this.webSocket.addEventListener("message", f);
  }

  public once(action: MessageAction, f: (data: any) => void) {
    const handler = (data: any) => {
      f(data);

      this.setActionHandler(action, undefined);
    };

    this.setActionHandler(action, handler);
  }

  private static parseAction(action: any): MessageAction {
    if (!Object.values(MessageAction).includes(action as MessageAction)) {
      throw new Error(`Unknown action ${action}.`);
    }

    return action as MessageAction;
  }
}