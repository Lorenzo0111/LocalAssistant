import { initializeServer } from "./api/server";
import { registerBuiltInCommands } from "./builtin/commands";
import { registerTestingDevice } from "./builtin/testing";
import { registerBuiltInTools } from "./builtin/tools";
import { AssistantCLI } from "./cli";
import type { IntelligenceProvider } from "./handlers/ai";
import { DeviceHandler } from "./handlers/devices";
import { type EventArgs, EventBus } from "./handlers/event-bus";
import { RequestHandler } from "./handlers/request";
import { SettingHandler } from "./handlers/settings";
import { ToolHandler } from "./handlers/tools";
import { PluginLoader } from "./plugin/loader";
import { initializeLogger, logger } from "./services/logger";

export let assistant: Assistant;

export class Assistant {
  readonly eventBus = new EventBus();
  readonly pluginLoader = new PluginLoader();
  readonly requestHandler = new RequestHandler();
  readonly toolsHandler = new ToolHandler();
  readonly deviceHandler = new DeviceHandler();
  readonly settingsManager = new SettingHandler();
  readonly cli = new AssistantCLI();

  constructor() {
    assistant = this;

    process.on("exit", async () => {
      await this.stop();
    });

    process.on("SIGINT", () => process.exit(0));
    process.on("SIGTERM", () => process.exit(0));
  }

  async start() {
    const startTime = Date.now();
    initializeLogger();

    await this.settingsManager.init();

    const PORT = initializeServer();
    logger.info(`Server listening on port ${PORT}`);

    registerBuiltInCommands();
    registerBuiltInTools();

    if (process.env.TESTING) registerTestingDevice();

    await this.pluginLoader.loadPlugins();

    this.eventBus.emit("startup");
    logger.info(`Application initialized in ${Date.now() - startTime}ms`);
  }

  async stop() {
    await this.pluginLoader.unloadPlugins();
  }

  async eval(message: string) {
    return this.requestHandler.handleRequest({ content: message });
  }

  on<T extends keyof EventArgs>(
    event: T,
    listener: (...args: EventArgs[T]) => void,
  ) {
    this.eventBus.on(event, listener);
  }

  setAI(ai: IntelligenceProvider) {
    logger.info(`AI provider set to ${ai.name}`);
    this.requestHandler.setAI(ai);
  }
}
