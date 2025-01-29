import { existsSync, mkdirSync } from "node:fs";
import pino from "pino";

export function initializeLogger() {
  if (!existsSync("logs")) {
    mkdirSync("logs");
  }
}

export const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          ignore: "pid,hostname",
        },
      },
      {
        target: "pino/file",
        options: {
          destination: "logs/app.log",
        },
      },
    ],
  },
});

export const createLogger = (name: string) => logger.child({ name });
