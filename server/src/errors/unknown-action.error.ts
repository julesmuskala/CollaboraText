import { WsError } from ".";

export class UnknownActionError extends WsError {
  public constructor(action: string) {
    super("err-unknown-action", `Unknown action ${action}.`);
  }
}
