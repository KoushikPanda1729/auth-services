import winston from "winston";
import { Config } from ".";

export const logger = winston.createLogger({
  level: "info",
  defaultMeta: {
    serviceName: "auth-services",
  },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      level: "info",
      dirname: "log",
      filename: "app.log",

      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.File({
      level: "error",
      dirname: "log",
      filename: "error.log",
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.Console({
      level: "info",
      silent: Config.NODE_ENV === "test",
    }),
  ],
});
