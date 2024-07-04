export class WsError extends Error {
  public constructor(public id: string, message: string) {
    super(message);
  }
}

export * from "./auth-required.error";
export * from "./no-doc.error";
export * from "./no-socket.error";
export * from "./patch-apply.error";
export * from "./payload-parse.error";
export * from "./socket-close.error";
export * from "./socket-doc-open.error";
export * from "./unknown-action.error";
export * from "./socket-no-doc.error";
export * from "./create-doc.error";
