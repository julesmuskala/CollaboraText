import { z } from "zod";

export const createConfig = (env: any) => {
  const config = {
    postgresUser: env.POSTGRES_USER,
    postgresHost: env.POSTGRES_HOST,
    postgresDatabase: env.POSTGRES_DB,
    postgresPassword: env.POSTGRES_PASSWORD,
    postgresPort: env.POSTGRES_PORT,
    port: env.PORT,
  };

  const schema = z.object({
    postgresUser: z.string(),
    postgresHost: z.string(),
    postgresDatabase: z.string(),
    postgresPassword: z.string(),
    postgresPort: z.string().regex(/^\d+$/).transform(Number),
    port: z.string().regex(/^\d+$/).transform(Number),
  });

  return schema.parse(config);
}
