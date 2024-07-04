import { z } from "zod";

import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { logAction } from "../../utils/log";

interface UpdateDocNamePayload {
  name: string;
}

export const UPDATE_DOC_NAME_ACTION = "update-doc-name";

export class UpdateDocNameHandler implements ActionHandler<UpdateDocNamePayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ name }: UpdateDocNamePayload) {
    const { socket, docManager, socketManager } = this.params;

    const doc = await docManager.updateDocName(socket, name);
    const docDto = doc.toDto();

    const result = {
      id: docDto.id,
      name: docDto.name,
    };

    for (const socketId of doc.getOpenSockets()) {
      socketManager.getSocket(socketId).send(UPDATE_DOC_NAME_ACTION, result);
    }

    logAction(UPDATE_DOC_NAME_ACTION, { userId: socket.getUser(), docId: socket.getOpenDocId(), name });
  }

  public validatePayload(payload: any) {
    const schema = z.object({
      name: z.string(),
    });

    schema.parse(payload);
  }
}
