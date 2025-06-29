import app from "./app";
import { logger } from "./config/logger";
import { Config } from "./config";
import AppDataSource from "./config/data-source";

const startServer = async () => {
  const { PORT } = Config;
  try {
    await AppDataSource.initialize();
    logger.info("Database connected successfully");
    app.listen(PORT, () => {
      logger.info("app is running at port ", { port: PORT });
    });
  } catch (error) {
    logger.info("Error occured while starting the server", { error });

    process.exit(1);
  }
};
void startServer();
