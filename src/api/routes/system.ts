import { Hono } from "hono";
import { assistant } from "../../assistant";

export const systemRoute = new Hono().get("/health", (ctx) => {
  return ctx.json({
    status: "ok",
    version: "1.0.0",
    plugins: assistant.pluginLoader.plugins.map((plugin) => plugin.name),
  });
});
