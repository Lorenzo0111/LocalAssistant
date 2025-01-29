import type { Message } from "@prisma/client";
import {
  type CoreMessage,
  type LanguageModelV1,
  type Tool,
  generateText,
  tool,
} from "ai";
import { assistant } from "../assistant";
import type { ResponseType } from "../types/responses";

export abstract class IntelligenceProvider {
  abstract readonly name: string;

  abstract process(
    previousMessages: Message[],
    input: string,
  ): Promise<ResponseType>;
}

export class BasicAIProvider extends IntelligenceProvider {
  name = "Basic";
  model: LanguageModelV1;

  constructor(model: LanguageModelV1) {
    super();
    this.model = model;
  }

  override async process(
    previousMessages: Message[],
    input: string,
  ): Promise<ResponseType> {
    const messages: CoreMessage[] = [];

    for (const message of previousMessages) {
      messages.push({
        role: "user",
        content: message.request,
      });

      messages.push({
        role: "system",
        content: message.response,
      });
    }

    messages.push({
      role: "user",
      content: input,
    });

    const tools: Record<string, Tool> = {};

    for (const toolData of assistant.toolsHandler.tools) {
      tools[toolData.name] = tool({
        description: toolData.description,
        parameters: toolData.requiredArgs,
        execute: async (args) =>
          await assistant.toolsHandler.executeTool(toolData.name, args),
      });
    }

    const response = await generateText({
      model: this.model,
      maxTokens: 300,
      system:
        process.env.AI_SYSTEM_PROMPT ??
        `You are a helpful voice assistant called Lisa.
        Answer the user's question in a helpful and friendly manner.
        You can use tools to trigger actions like turning on lights or setting reminders.
        When you need to trigger an action for a device, retrieve the device and action id before triggering any action, you can do so by using the device-list or device-get tool.
        You always have to give a response to the user's prompt, it can also just be an acknowledgment if an action was triggered.
        `,
      messages,
      tools,
      maxSteps: 9,
    });

    return { content: response.text, tokens: response.usage.totalTokens };
  }
}
