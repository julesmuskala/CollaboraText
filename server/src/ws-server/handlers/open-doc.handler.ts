import { z } from "zod";

import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { logAction } from "../../utils/log";

interface OpenDocPayload {
  docId: string;
}

export const OPEN_DOC_ACTION = "open-doc";

export class OpenDocHandler implements ActionHandler<OpenDocPayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ docId }: OpenDocPayload) {
    const { docManager, socket } = this.params;

    const doc = await docManager.openDoc(socket, docId);

    const isOwned = doc.isOwned(socket.getUser()?.getId());

    socket.send(OPEN_DOC_ACTION, { ...doc.toDto(), isOwned });

    logAction(OPEN_DOC_ACTION, { docId });
  }

  public validatePayload(payload: any) {
    const schema = z.object({
      docId: z.string(),
    });

    schema.parse(payload);
  }
}
