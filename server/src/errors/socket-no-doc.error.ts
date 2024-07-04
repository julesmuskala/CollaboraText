import { WsError } from ".";

export class SocketNoDocError extends WsError {
  public constructor(id: string) {
    super("err-socket-no-doc", `Socket ${id} has not opened a document.`);
  }
}
