import { z } from "zod";

import { ActionHandler } from "../action-handler";
import { HandlerParams } from "../handler";
import { logAction } from "../../utils/log";

interface AuthUserPayload {
  token: string;
}

export const AUTH_USER_ACTION = "auth-user";

export class AuthUserHandler implements ActionHandler<AuthUserPayload> {
  public constructor(private params: HandlerParams) { }

  public async handle({ token }: AuthUserPayload) {
    const { socket, authManager } = this.params;

    const user = await authManager.authUser(token);

    socket.setUser(user);

    socket.send(AUTH_USER_ACTION, { userId: user.getId() });

    logAction(AUTH_USER_ACTION, { user });
  }

  public validatePayload(payload: any) {
    const schema = z.object({
      token: z.string(),
    });

    schema.parse(payload);
  }
}
