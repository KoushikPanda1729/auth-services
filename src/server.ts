import { config } from "dotenv";
import app from "./app";
import { logger } from "./config/logger";

config();

const startServer = () => {
  const { PORT } = process.env;
  try {
    app.listen(PORT, () => {
      logger.info("app is running at port ", { port: PORT });
    });
  } catch (error) {
    logger.info("Error occured while starting the server", { error });

    process.exit(1);
  }
};
startServer();
