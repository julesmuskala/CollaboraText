import { config as envConfig } from "dotenv";

import { createConfig } from "./config";
import { DocManager, AuthManager } from "./managers";
import { initializeServer } from "./ws-server";
import { DbClient, DocRepository, UserRepository } from "./db";

const main = () => {
  envConfig();

  const config = createConfig(process.env);

  const dbClient = new DbClient({
    host: config.postgresHost,
    port: config.postgresPort,
    user: config.postgresUser,
    password: config.postgresPassword,
    database: config.postgresDatabase,
  });

  const userRepository = new UserRepository({ dbClient });
  const docRepository = new DocRepository({ dbClient });

  const docManager = new DocManager({ docRepository });
  const authManager = new AuthManager({ userRepository });

  authManager.init();

  initializeServer({
    docManager,
    authManager,
    port: config.port
  });
};

main();
