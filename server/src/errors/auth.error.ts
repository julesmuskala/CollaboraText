import { WsError } from ".";

export class AuthError extends WsError {
  public constructor() {
    super("err-auth", "Authentication failed.");
  }
}
