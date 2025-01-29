import type { RegistrablePlugin } from ".";
import { assistant } from "../assistant";
import { createLogger } from "../services/logger";

export class PluginLoader {
  plugins: RegistrablePlugin[] = [];
  private readonly logger = createLogger("plugin-loader");

  async loadPlugins(): Promise<void> {
    const loadedPlugins =
      assistant.settingsManager
        .getSetting("ENABLED_PLUGINS")
        ?.value.split(",") ?? [];

    if (loadedPlugins[0] === "") loadedPlugins.shift();

    for (const plugin of loadedPlugins) await this.loadPlugin(plugin);

    this.logger.info(
      `Loaded ${this.plugins.length} plugins: ${
        this.plugins.map((p) => p.name).join(", ") || "N/A"
      }`,
    );
  }

  async loadPlugin(name: string): Promise<void> {
    try {
      const { default: pluginModule } = await import(
        `../../plugins/${name}/index.ts`
      );

      const instance: RegistrablePlugin = new pluginModule();
      await instance.register();

      this.plugins.push(instance);
    } catch (e) {
      this.logger.error(
        `Failed to load plugin ${name}: ${
          e instanceof Error && "message" in e ? e.message : e
        }`,
      );
    }
  }

  async unloadPlugins(): Promise<void> {
    for (const plugin of this.plugins) {
      try {
        await plugin.unregister();
      } catch (e) {
        this.logger.error(`Failed to unload plugin ${plugin.name}`, e);
      }
    }

    this.logger.info(`Unloaded ${this.plugins.length} plugins`);
    this.plugins = [];
  }
}
