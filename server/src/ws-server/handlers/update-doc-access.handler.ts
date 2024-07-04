import { z } from "zod";

import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { logAction } from "../../utils/log";
import { AccessLevel } from "../../units";
import { CLOSE_DOC_ACTION } from "./close-doc.handler";

interface UpdateDocAccessPayload {
  accessLevel: AccessLevel;
}

export const UPDATE_DOC_ACCESS_ACTION = "update-doc-access";

export class UpdateDocAccessHandler implements ActionHandler<UpdateDocAccessPayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ accessLevel }: UpdateDocAccessPayload) {
    const { docManager, socketManager, socket } = this.params;

    const doc = await docManager.updateDocAccess(socket, accessLevel);
    const docDto = doc.toDto();

    const result = {
      id: docDto.id,
      accessLevel: docDto.accessLevel,
    };

    switch (accessLevel) {
      case AccessLevel.ONLY_OWNER: {
        await Promise.all(doc.getOpenSockets().map(async (socketId) => {
          const closingSocket = socketManager.getSocket(socketId);
          if (closingSocket.getUser()?.getId() === docDto.creatorId) {
            return;
          }

          await docManager.closeDoc(closingSocket);
          closingSocket.send(CLOSE_DOC_ACTION, {});
          logAction(CLOSE_DOC_ACTION, { userId: closingSocket.getUser(), docId: docDto.id });
        }));

        break;
      }
      case AccessLevel.READONLY:
        break;
      case AccessLevel.ANYONE:
        break;
    }

    for (const socketId of doc.getOpenSockets()) {
      socketManager.getSocket(socketId).send(UPDATE_DOC_ACCESS_ACTION, result);
    }

    logAction(UPDATE_DOC_ACCESS_ACTION, { userId: socket.getUser(), docId: socket.getOpenDocId(), accessLevel });
  }

  public validatePayload(payload: any) {
    const schema = z.object({
      accessLevel: z.nativeEnum(AccessLevel),
    });

    schema.parse(payload);
  }
}
