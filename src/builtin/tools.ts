import { z } from "zod";
import { assistant } from "../assistant";

export function registerBuiltInTools() {
  assistant.toolsHandler.registerTool({
    name: "random",
    description: "Generate a random number",
    requiredArgs: z.object({
      min: z.number(),
      max: z.number(),
    }),
    async execute(args) {
      return {
        random: Math.round(Math.random() * (args.max - args.min) + args.min),
      };
    },
  });

  assistant.toolsHandler.registerTool({
    name: "device-list",
    description: "List all devices",
    requiredArgs: z.object({}),
    async execute() {
      return { devices: await assistant.deviceHandler.getDevices() };
    },
  });

  assistant.toolsHandler.registerTool({
    name: "device-get",
    description: "Get a specific device",
    requiredArgs: z.object({
      idOrName: z.string(),
    }),
    async execute(args) {
      const device = await assistant.deviceHandler.getDevice(args.idOrName);
      if (!device) return { error: "Device not found" };

      return device;
    },
  });

  assistant.toolsHandler.registerTool({
    name: "device-action",
    description: "Execute an action on a device",
    requiredArgs: z.object({
      id: z.string(),
      action: z.string(),
    }),
    async execute(args) {
      const res = await assistant.deviceHandler.executeAction(
        args.id,
        args.action,
      );

      return {
        success: res,
      };
    },
  });
}
