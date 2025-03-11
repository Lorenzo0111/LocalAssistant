import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { assistant } from "../../assistant";
import { z } from "zod";

export const settingsRoute = new Hono()
  .get("/", async (ctx) => {
    const settings = assistant.settingsManager.allSettings();

    return ctx.json(settings);
  })
  .post(
    "/:key",
    zValidator(
      "json",
      z.object({
        value: z.string(),
      }),
    ),
    async (ctx) => {
      const key = ctx.req.param("key");
      const { value } = ctx.req.valid("json");

      await assistant.settingsManager.setSetting(key, value);

      return ctx.json({
        success: true,
      });
    },
  );
