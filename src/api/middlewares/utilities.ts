import { createMiddleware } from "hono/factory";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { logger } from "../../services/logger";

export const loggerMiddleware = createMiddleware(async (ctx, next) => {
  if (process.env.LOG_REQUESTS || process.env.NODE_ENV === "development")
    logger.info(`${ctx.req.method} ${ctx.req.url}`);

  return await next();
});

export const errorMiddleware = createMiddleware(async (ctx, next) => {
  await next();

  if (ctx.error) {
    ctx.res = ctx.newResponse(
      JSON.stringify({
        error: ctx.error.message,
      }),
      "status" in ctx.error ? (ctx.error.status as ContentfulStatusCode) : 500,
      {
        "Content-Type": "application/json",
      },
    );
  }
});
