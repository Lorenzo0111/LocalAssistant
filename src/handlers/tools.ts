import type { z } from "zod";
import { createLogger } from "../services/logger";
import { InvalidToolError } from "../types/errors";

export abstract class Tool {
  abstract readonly name: string;
  abstract readonly description: string;
  // biome-ignore lint/suspicious/noExplicitAny: any is required here
  abstract readonly requiredArgs: z.ZodObject<any>;

  abstract execute(args: z.infer<typeof this.requiredArgs>): Promise<unknown>;
}

export class ToolHandler {
  private readonly logger = createLogger("tool-manager");
  readonly tools: Tool[] = [];

  registerTool(tool: Tool): void {
    const existingTool = this.tools.find((t) => t.name === tool.name);
    if (existingTool)
      throw new InvalidToolError(`Tool with name ${tool.name} already exists`);

    this.tools.push(tool);
  }

  async executeTool(name: string, args: unknown): Promise<unknown> {
    const tool = this.tools.find((t) => t.name === name);
    if (!tool) throw new InvalidToolError(`Tool with name ${name} not found`);

    this.logger.info(`Executing tool ${name}`);
    const res = await tool.execute(args as z.infer<typeof tool.requiredArgs>);

    return res;
  }
}
