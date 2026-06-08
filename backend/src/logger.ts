import pino from "pino";
import { config } from "./config.js";

const transport =
  config.isProd || config.env === "production"
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname",
        },
      };

export const logger = pino({
  level: config.logLevel,
  transport,
  base: { service: "geton-api" },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.pin",
      "*.pinHash",
      "*.token",
      "*.refreshToken",
    ],
    censor: "[REDACTED]",
  },
});
