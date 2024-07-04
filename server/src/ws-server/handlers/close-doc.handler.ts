import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { logAction } from "../../utils/log";

interface CloseDocPayload { }

export const CLOSE_DOC_ACTION = "close-doc";

export class CloseDocHandler implements ActionHandler<CloseDocPayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ }: CloseDocPayload) {
    const { docManager, socket } = this.params;

    if (socket.getOpenDocId()) {
      await docManager.closeDoc(socket);
    }

    logAction(CLOSE_DOC_ACTION, { userId: socket.getUser() });
  }
}
