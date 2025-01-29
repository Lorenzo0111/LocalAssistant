import { assistant } from "../assistant";
import { createLogger } from "../services/logger";
import { prisma } from "../services/prisma";
import { InvalidSetupError } from "../types/errors";
import type { RequestType } from "../types/requests";
import type { ResponseType } from "../types/responses";
import type { IntelligenceProvider } from "./ai";

export class RequestHandler {
  private readonly logger = createLogger("request-handler");
  private ai?: IntelligenceProvider;

  async handleRequest(request: RequestType): Promise<ResponseType> {
    if (!this.ai) throw new InvalidSetupError("AI provider is not set");

    this.logger.info(`Handling request: ${request.content}`);
    assistant.eventBus.emit("request:create", request);

    const previousMessages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const response = await this.ai.process(previousMessages, request.content);

    await prisma.message.create({
      data: {
        request: request.content,
        response: response.content,
        tokens: response.tokens ?? 0,
      },
    });

    assistant.eventBus.emit("request:process", request, response);

    return response;
  }

  setAI(ai: IntelligenceProvider) {
    this.ai = ai;
  }
}
