import { assistant } from "../assistant";
import { createLogger } from "../services/logger";

export abstract class RegistrablePlugin {
  abstract readonly name: string;
  protected readonly logger = () => createLogger(`plugin: ${this.name}`);
  protected readonly assistant = assistant;

  abstract register(): Promise<void>;
  abstract unregister(): Promise<void>;
}
