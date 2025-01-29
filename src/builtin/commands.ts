import { assistant } from "../assistant";
import type { Command } from "../cli/command";
import { createLogger } from "../services/logger";

const echoCommand: Command = {
  name: "echo",
  description: "Echoes the input",
  usage: "echo <text>",
  args: 1,
  run: async (args) => {
    return args.join(" ");
  },
};

const settingCommand: Command = {
  name: "setting",
  description: "Manage settings",
  usage: "setting <get|set|list> [key] [value]",
  args: 1,
  run: async (args) => {
    const [action, key, value] = args;

    switch (action.toLowerCase()) {
      case "get":
        if (!key) return "Key is required";

        return assistant.settingsManager.getSetting(key)?.value ?? "Not set";
      case "set":
        if (!key) return "Key is required";

        await assistant.settingsManager.setSetting(key, value);
        return `Set ${key} to ${value}`;
      case "list":
        return `\n${assistant.settingsManager
          .allSettings()
          .map((s) => `${s.key}: ${s.value}`)
          .join("\n")}`;
      default:
        return `Unknown action: ${action}`;
    }
  },
};

const enableCommand: Command = {
  name: "enable",
  description: "Enable a plugin",
  usage: "enable <plugin>",
  args: 1,
  run: async (args) => {
    const [plugin] = args;

    const enabledPlugins =
      assistant.settingsManager
        .getSetting("ENABLED_PLUGINS")
        ?.value.split(",") ?? [];

    if (enabledPlugins[0] === "") enabledPlugins.shift();
    if (enabledPlugins.includes(plugin)) return "Plugin is already enabled";

    enabledPlugins.push(plugin);
    await assistant.settingsManager.setSetting(
      "ENABLED_PLUGINS",
      enabledPlugins.join(","),
    );

    await assistant.pluginLoader.loadPlugin(plugin);

    return `Enabled plugin ${plugin}`;
  },
};

export function registerBuiltInCommands() {
  assistant.cli.registerCommand(echoCommand);
  assistant.cli.registerCommand(settingCommand);
  assistant.cli.registerCommand(enableCommand);
}
