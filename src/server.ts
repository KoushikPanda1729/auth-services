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
    logger.info("env variables", {
      PORT,
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_NAME: process.env.DATABASE_NAME,
      DATABASE_USERNAME: process.env.DATABASE_USERNAME,
      DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
      DATABASE_HOST: process.env.DATABASE_HOST,
    });

    process.exit(1);
  }
};
void startServer();
