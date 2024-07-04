import { z } from "zod";

import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { logAction } from "../../utils/log";
import { SortingOrder, SortingValues } from "../../db";

interface OpenDocsPayload {
  take?: number;
  skip?: number;
  order?: SortingOrder;
  sortBy?: SortingValues
}

export const OPEN_DOCS_ACTION = "open-docs";

export class OpenDocsHandler implements ActionHandler<OpenDocsPayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ take, skip, order, sortBy }: OpenDocsPayload) {
    const { socket } = this.params;

    const briefDocs = await this.params.docManager.openDocs(socket, take, skip, order, sortBy);

    socket.send(OPEN_DOCS_ACTION, briefDocs);

    logAction(OPEN_DOCS_ACTION, { userId: socket.getUser() });
  }

  public validatePayload(payload: any) {
    const schema = z.object({
      take: z.number().min(0).max(16).optional(),
      skip: z.number().min(0).optional(),
      order: z.nativeEnum(SortingOrder).optional(),
      sortBy: z.nativeEnum(SortingValues).optional(),
    });

    schema.parse(payload);
  }
}
