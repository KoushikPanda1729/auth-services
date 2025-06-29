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
    // logger.info("env  error", {
    //   PORT: Config.PORT,
    //   DB_HOST: Config.DB_HOST,
    //   DB_PORT: Config.DB_PORT,
    //   DB_USERNAME: Config.DB_USERNAME,
    //   DB_PASSWORD: Config.DB_PASSWORD,
    //   DB_NAME: Config.DB_NAME,
    //   REFRESH_TOKEN_SECRET: Config.REFRESH_TOKEN_SECRET,
    //   JWKS_URI: Config.JWKS_URI,
    //   PRIVATE_KEY: Config.PRIVATE_KEY,
    //   DB_SSL: Config.DB_SSL,
    // });

    process.exit(1);
  }
};
void startServer();
