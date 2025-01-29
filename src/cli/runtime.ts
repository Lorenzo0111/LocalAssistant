import type { Assistant } from "../assistant";
import { createLogger } from "../services/logger";
import { CLIError } from "../types/errors";

export async function initRuntimeCLI(assistant: Assistant) {
  const logger = createLogger("cli");

  for await (const input of console) {
    if (input.trim() === "") continue;

    try {
      const response = await assistant.cli.processCommand(input);
      logger.info(`"${input}" -> ${response}`);
    } catch (error) {
      if (error instanceof CLIError) logger.error(`${error.message}`);
      else if (error instanceof Error)
        logger.error(`An error occurred: ${error.message}`);
    }
  }
}
