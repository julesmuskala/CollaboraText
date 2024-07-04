import { truncateString } from "../../utils/string";
import { AuthRequiredError, NoDocError } from "../../errors";
import { BriefDocDto, Doc, User } from "../../units";
import { DbClient, SortingOrder } from "../db-client";

interface DocRepositoryParams {
  dbClient: DbClient;
}

export enum SortingValues {
  NAME = "name",
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
}

export class DocRepository {
  public constructor(private params: DocRepositoryParams) { }

  public async createDoc(doc: Doc) {
    const { id, name, creatorId, accessLevel, body, createdAt, updatedAt } = doc.toDto();

    await this.params.dbClient.executeQuery(
      `INSERT INTO "document" ("id", "name", "creator_id", "access_level", "body", "created_at", "updated_at") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, name, creatorId, accessLevel, body, createdAt, updatedAt]
    );
  }

  public async getDoc(docId: string, user?: User, elevatedAccess = false): Promise<Doc> {
    if (elevatedAccess && !user) {
      throw new AuthRequiredError();
    }

    const result = await this.params.dbClient.executeQuery(
      `SELECT * FROM "document" WHERE "id" = $1 AND ("access_level" != 'ONLY_OWNER' OR ("access_level" = 'ONLY_OWNER' AND "creator_id" = $2))`,
      [docId, user?.getId() || null]
    );

    if (!result.rowCount) {
      throw new NoDocError(docId);
    }

    const { id, name, creator_id, access_level, body, created_at, updated_at } = result.rows[0];

    return Doc.fromDto({
      id,
      name,
      creatorId: creator_id,
      accessLevel: access_level,
      body,
      createdAt: created_at,
      updatedAt: updated_at,
    });
  }

  public async getBriefDocs(
    take: number,
    skip: number,
    order: SortingOrder,
    sortBy: SortingValues,
    user?: User
  ): Promise<BriefDocDto[]> {
    const result = await this.params.dbClient.executeQuery(
      `SELECT "id", "name", "creator_id", "body", "created_at", "updated_at" FROM "document" WHERE "creator_id" = $1 ORDER BY "${sortBy}" ${order} LIMIT $2 OFFSET $3`,
      [user?.getId() || null, take, skip]
    );

    return result.rows.map(({ id, name, body, creator_id, created_at, updated_at }) => ({
      id,
      name,
      briefBody: truncateString(body),
      creatorId: creator_id,
      createdAt: created_at,
      updatedAt: updated_at,
    }));
  }

  public async updateDoc(doc: Doc, user?: User, elevatedAccess = false): Promise<Doc> {
    const { id, name, accessLevel, body, updatedAt } = doc.toDto();

    await this.getDoc(id, user, elevatedAccess);

    await this.params.dbClient.executeQuery(
      `UPDATE "document" SET "name" = $2, "access_level" = $3, "body" = $4, "updated_at" = $5 WHERE "id" = $1`,
      [id, name, accessLevel, body, updatedAt]
    );

    return doc;
  }

  public async updateDocAdmin(doc: Doc): Promise<Doc> {
    const { id, name, accessLevel, body, updatedAt } = doc.toDto();

    const result = await this.params.dbClient.executeQuery(
      `SELECT * FROM "document" WHERE "id" = $1`,
      [id]
    );

    if (!result.rowCount) {
      throw new NoDocError(id);
    }

    await this.params.dbClient.executeQuery(
      `UPDATE "document" SET "name" = $2, "access_level" = $3, "body" = $4, "updated_at" = $5 WHERE "id" = $1`,
      [id, name, accessLevel, body, updatedAt]
    );

    return doc;
  }

  public async deleteDoc(doc: Doc, user: User) {
    await this.params.dbClient.executeQuery(
      `DELETE FROM "document" WHERE "id" = $1 AND "creator_id" = $2`,
      [doc.getId(), user.getId()]
    );
  }
}
