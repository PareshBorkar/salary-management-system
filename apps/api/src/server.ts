import { createApp } from "./app.js";
import { env } from "./shared/config/env.js";

async function start() {
  const app = await createApp();

  const shutdown = async (signal: NodeJS.Signals) => {
    app.log.info({ signal }, "shutting down api server");
    await app.close();
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
