
import { createLogger, LoggerOptions, transports, format } from "winston";

const { combine, timestamp, colorize, prettyPrint, json, printf } = format;
const options: LoggerOptions = {
  format: combine(
    colorize(),
    timestamp(),
    printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === "production" ? "error" : "debug"
    }),
    new transports.File({ filename: "debug.log", level: "debug" })
  ]
};

const logger = createLogger(options);

if (process.env.NODE_ENV !== "production") {
  logger.debug("Logging initialized at debug level");
}

export default logger;
