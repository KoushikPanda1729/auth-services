import { config } from "dotenv";
import app from "./app";
import { logger } from "./config/logger";
import { AppDataSource } from "./config/data-source";

config();

const startServer = async () => {
  const { PORT } = process.env;
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
