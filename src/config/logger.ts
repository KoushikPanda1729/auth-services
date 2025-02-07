import winston from "winston";
import { Config } from ".";

export const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "auth-services",
  },
  transports: [
    new winston.transports.File({
      level: "info",
      dirname: "log",
      filename: "app.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.File({
      level: "error",
      dirname: "log",
      filename: "error.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      silent: Config.NODE_ENV === "test",
    }),
  ],
});
