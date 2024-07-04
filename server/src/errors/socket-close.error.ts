import { WsError } from ".";

export class SocketCloseError extends WsError {
  public constructor(id: string) {
    super("err-socket-close", `Socket ${id} did not close properly.`);
  }
}
