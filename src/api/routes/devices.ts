import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { assistant } from "../../assistant";

export const devicesRoute = new Hono()
  .get("/", async (ctx) => {
    const devices = await assistant.deviceHandler.getDevices();
    return ctx.json(devices);
  })
  .get("/:id", async (ctx) => {
    const id = ctx.req.param("id");

    const device = await assistant.deviceHandler.getDevice(id);
    return ctx.json({
      ...device,
      adapter: undefined,
    });
  })
  .post(
    "/:id/execute",
    zValidator(
      "json",
      z.object({
        action: z.string(),
      }),
    ),
    async (ctx) => {
      const id = ctx.req.param("id");
      const body = ctx.req.valid("json");

      const res = await assistant.deviceHandler.executeAction(id, body.action);
      return ctx.json({
        success: res,
      });
    },
  );
