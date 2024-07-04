import { z } from "zod";

import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { logAction } from "../../utils/log";

interface EditDocPayload {
  patches: any;
}

export const EDIT_DOC_ACTION = "edit-doc";

export class EditDocHandler implements ActionHandler<EditDocPayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ patches }: EditDocPayload) {
    const { docManager, socketManager, socket } = this.params;

    const doc = await docManager.editDoc(socket, patches);

    const result = {
      id: doc.getId(),
      patches,
    }

    for (const socketId of doc.getOpenSockets()) {
      if (socketId === socket.getId()) {
        continue;
      }

      socketManager.getSocket(socketId).send(EDIT_DOC_ACTION, result);
    }

    logAction(EDIT_DOC_ACTION, { userId: socket.getUser()?.getId(), docId: doc.getId() });
  }

  public validatePayload(payload: any) {
    const schema = z.object({
      patches: z.any(),
    });

    schema.parse(payload);
  }
}
