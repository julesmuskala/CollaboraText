import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { logAction } from "../../utils/log";

interface CreateDocPayload { }

export const CREATE_DOC_ACTION = "create-doc";

export class CreateDocHandler implements ActionHandler<CreateDocPayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ }: CreateDocPayload) {
    const { socket } = this.params;

    const user = socket.getUser();
    const userId = user?.getId();

    const doc = await this.params.docManager.createDoc(socket);

    socket.send(CREATE_DOC_ACTION, { id: doc.getId() });

    logAction(CREATE_DOC_ACTION, { userId, docId: doc.getId() });
  }
}
