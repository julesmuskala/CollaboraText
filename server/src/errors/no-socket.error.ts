import { WsError } from ".";

export class NoSocketError extends WsError {
  public constructor(id: string) {
    super("err-no-socket", `Socket ${id} not found.`);
  }
}
