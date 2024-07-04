import { RawData } from "ws";
import { z } from "zod";

import {
  CREATE_DOC_ACTION, CreateDocHandler,
  OPEN_DOC_ACTION, OpenDocHandler,
  EDIT_DOC_ACTION, EditDocHandler,
  OPEN_DOCS_ACTION, OpenDocsHandler,
  UPDATE_DOC_ACCESS_ACTION, UpdateDocAccessHandler,
  UPDATE_DOC_NAME_ACTION, UpdateDocNameHandler,
  CLOSE_DOC_ACTION, CloseDocHandler,
  DELETE_DOC_ACTION, DeleteDocHandler,
  AUTH_USER_ACTION, AuthUserHandler,
  FOCUS_DOC_ACTION, FocusDocHandler,
} from "./handlers";
import { ActionHandler } from "./action-handler";
import { AuthManager, DocManager, SocketManager } from "../managers";
import { logError } from "../utils/log";
import { PayloadParseError, WsError } from "../errors";
import { Socket } from "../units";

export interface HandlerParams {
  socket: Socket;
  authManager: AuthManager;
  docManager: DocManager;
  socketManager: SocketManager;
}

export class Handler {
  private actionHandlers: Map<string, ActionHandler<any>> = new Map();

  public constructor(private params: HandlerParams) {
    this.actionHandlers.set(AUTH_USER_ACTION, new AuthUserHandler(params));
    this.actionHandlers.set(CLOSE_DOC_ACTION, new CloseDocHandler(params));
    this.actionHandlers.set(CREATE_DOC_ACTION, new CreateDocHandler(params));
    this.actionHandlers.set(DELETE_DOC_ACTION, new DeleteDocHandler(params));
    this.actionHandlers.set(OPEN_DOC_ACTION, new OpenDocHandler(params));
    this.actionHandlers.set(FOCUS_DOC_ACTION, new FocusDocHandler(params));
    this.actionHandlers.set(EDIT_DOC_ACTION, new EditDocHandler(params));
    this.actionHandlers.set(OPEN_DOCS_ACTION, new OpenDocsHandler(params));
    this.actionHandlers.set(UPDATE_DOC_ACCESS_ACTION, new UpdateDocAccessHandler(params));
    this.actionHandlers.set(UPDATE_DOC_NAME_ACTION, new UpdateDocNameHandler(params));
  }

  public async handleMessage(data: RawData) {
    try {
      const [action, payload] = Handler.parseData(data);

      const actionHandler = this.getActionHandler(action);

      try {
        actionHandler.validatePayload?.(payload);
      } catch (err) {
        throw new PayloadParseError();
      }

      await actionHandler.handle(payload);
    } catch (err) {
      if (err instanceof WsError) {
        this.params.socket.send(err.id, err.message);
      }

      logError(err.message);
    }
  }

  public async handleClose() {
    try {
      await new CloseDocHandler(this.params).handle({});
    } catch (err) {
      logError(err.message);
    }
  }

  private static parseData(data: any) {
    const schema = z.tuple([z.string(), z.record(z.any())]);

    return schema.parse(JSON.parse(data));
  }

  private getActionHandler(action: string) {
    const actionHandler = this.actionHandlers.get(action);

    if (!actionHandler) {
      throw new Error(`Provied action ${action} is unknown.`);
    }

    return actionHandler;
  }
}
