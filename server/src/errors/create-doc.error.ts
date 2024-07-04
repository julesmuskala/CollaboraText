import { WsError } from ".";

export class CreateDocError extends WsError {
  public constructor() {
    super("err-create-doc", "Failed to create doc.");
  }
}
