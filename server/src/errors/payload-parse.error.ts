import { WsError } from ".";

export class PayloadParseError extends WsError {
  public constructor() {
    super("err-payload-parse", "Failed to parse payload.");
  }
}
