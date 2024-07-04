import { WsError } from ".";

export class SocketDocOpenError extends WsError {
  public constructor(id: string) {
    super("err-socket-doc-open", `Socket ${id} already has opened a document.`);
  }
}
