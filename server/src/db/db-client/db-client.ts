import { Pool, QueryResult } from "pg";

type QueryFunction<T> = (queryClient: {
  query: (query: string, params?: any[]) => Promise<QueryResult<any>>;
}) => Promise<T>;

interface DbClientParams {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export class DbClient {
  private pool: Pool;

  public constructor(private params: DbClientParams) {
    this.pool = new Pool(this.params);
  }

  public async executeQuery(query: string, params: any[] = []) {
    const client = await this.pool.connect();

    const result = await client.query(query, params);

    client.release();

    return result;
  }

  public async executeQueryFunction<T>(fn: QueryFunction<T>) {
    const client = await this.pool.connect();

    const result = await fn(client);

    client.release();

    return result;
  }
}
