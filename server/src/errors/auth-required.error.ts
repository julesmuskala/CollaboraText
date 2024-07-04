import { WsError } from ".";

export class AuthRequiredError extends WsError {
  public constructor() {
    super("err-auth-required", "Authentication required.");
  }
}
