import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { logAction } from "../../utils/log";

interface FocusDocPayload { }

export const FOCUS_DOC_ACTION = "focus-doc";

export class FocusDocHandler implements ActionHandler<FocusDocPayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ }: FocusDocPayload) {
    const { docManager, socket } = this.params;

    const doc = await docManager.focusDoc(socket);

    const isOwned = doc.isOwned(socket.getUser()?.getId());

    socket.send(FOCUS_DOC_ACTION, { ...doc.toDto(), isOwned });

    logAction(FOCUS_DOC_ACTION, { docId: doc.getId() });
  }
}
