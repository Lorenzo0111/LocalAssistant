import { createOpenAI } from "@ai-sdk/openai";
import { BasicAIProvider } from "../../src/handlers/ai";
import { RegistrablePlugin } from "../../src/plugin";

export default class OpenAIPlugin extends RegistrablePlugin {
  readonly name = "openai";

  async register(): Promise<void> {
    const [baseUrl, apiKey, model] = this.assistant.settingsManager.getSettings(
      ["OPENAI_BASE_URL", "OPENAI_API_KEY", "OPENAI_MODEL"],
    );

    const openai = createOpenAI({
      baseURL: baseUrl?.value,
      apiKey: apiKey?.value,
    });

    this.assistant.setAI(
      new BasicAIProvider(openai(model?.value ?? "gpt-4o-mini", {})),
    );
  }

  async unregister(): Promise<void> {}
}
