import { createOllama } from "ollama-ai-provider";
import { BasicAIProvider } from "../../src/handlers/ai";
import { RegistrablePlugin } from "../../src/plugin";
import { InvalidToolError } from "../../src/types/errors";

export default class OpenAIPlugin extends RegistrablePlugin {
  readonly name = "ollama";

  async register(): Promise<void> {
    const [modelId, baseUrl] = this.assistant.settingsManager.getSettings([
      "OLLAMA_MODEL_ID",
      "OLLAMA_BASE_URL",
    ]);

    if (!modelId || !baseUrl)
      throw new InvalidToolError("OLLAMA model ID or base URL not set");

    const ollama = createOllama({
      baseURL: baseUrl.value,
    });

    this.assistant.setAI(new BasicAIProvider(ollama(modelId.value)));
  }

  async unregister(): Promise<void> {}
}
