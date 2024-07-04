import { WsError } from ".";

export class NoDocError extends WsError {
  public constructor(id: string) {
    super("err-no-doc", `Document ${id} not found.`);
  }
}
