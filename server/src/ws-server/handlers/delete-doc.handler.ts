import { z } from "zod";

import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { CLOSE_DOC_ACTION } from "./close-doc.handler";
import { logAction } from "../../utils/log";

interface DeleteDocPayload {
  docId: string;
}

export const DELETE_DOC_ACTION = "delete-doc";

export class DeleteDocHandler implements ActionHandler<DeleteDocPayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ docId }: DeleteDocPayload) {
    const { socket, docManager, socketManager } = this.params;

    const doc = await docManager.getDoc(docId, socket.getUser(), true);
    const docDto = doc.toDto();

    await Promise.all(doc.getOpenSockets().map(async (socketId) => {
      const closingSocket = socketManager.getSocket(socketId);
      if (closingSocket.getUser()?.getId() === docDto.creatorId) {
        return;
      }

      await docManager.closeDoc(closingSocket);
      closingSocket.send(CLOSE_DOC_ACTION, {});
      logAction(CLOSE_DOC_ACTION, { userId: closingSocket.getUser(), docId: docDto.id });
    }));

    await docManager.deleteDoc(socket, docId);

    socket.send(DELETE_DOC_ACTION, {});

    logAction(DELETE_DOC_ACTION, { userId: socket.getUser(), docId: socket.getOpenDocId() });
  }

  public validatePayload(payload: any) {
    const schema = z.object({
      docId: z.string(),
    });

    schema.parse(payload);
  }
}
