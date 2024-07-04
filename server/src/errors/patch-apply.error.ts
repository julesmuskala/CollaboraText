import { WsError } from ".";

export class PatchApplyError extends WsError {
  public constructor() {
    super("err-patch-apply", "Failed to apply patch.");
  }
}
