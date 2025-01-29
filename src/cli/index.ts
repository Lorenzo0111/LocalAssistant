import { assistant } from "../assistant";
import { CLIError } from "../types/errors";
import type { Command } from "./command";

export class AssistantCLI {
  private readonly commands: Record<string, Command> = {};

  public registerCommand(command: Command) {
    if (this.commands[command.name])
      throw new CLIError(`Command ${command.name} already exists`);

    this.commands[command.name] = command;
  }

  async processCommand(input: string) {
    const [commandName, ...args] = input.replaceAll("\n", "").split(" ");
    const command = this.commands[commandName.toLowerCase()];

    if (!command) throw new CLIError(`Command ${commandName} not found`);
    if (args.length < command.args)
      throw new CLIError(`Invalid usage for ${commandName}: ${command.usage}`);

    assistant.eventBus.emit("command", command, args);
    return await command.run(args);
  }
}
