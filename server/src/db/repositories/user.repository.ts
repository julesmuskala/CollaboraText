import { User, AuthBody } from "../../units";
import { DbClient } from "../db-client";

interface UserRepositoryParams {
  dbClient: DbClient;
}

export class UserRepository {
  public constructor(private params: UserRepositoryParams) { }

  public async getUserByAuthBody(authBody: AuthBody): Promise<User | undefined> {
    const res = await this.params.dbClient.executeQuery(
      `SELECT * FROM "user" WHERE "user"."uid" = $1 AND "user"."email" = $2`,
      [authBody.uid, authBody.email],
    );

    if (res.rowCount === 0) {
      return undefined;
    }

    return this.parseUserRow(res.rows[0]);
  }

  public async createUser(authBody: AuthBody): Promise<User> {
    await this.params.dbClient.executeQuery(
      `INSERT INTO "user" ("uid", "email") VALUES ($1, $2)`,
      [authBody.uid, authBody.email]
    );

    return (await this.getUserByAuthBody(authBody))!;
  }

  private parseUserRow(row: any): User {
    return new User(row.id, row.uid, row.email);
  }
}
