import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (ctx, next) => {
  const token = ctx.req.header("Authorization");
  const split = token?.split(" ");

  if (!token || split?.[1] !== process.env.SECRET_TOKEN) {
    return ctx.json(
      {
        error: "Unauthorized",
      },
      401,
    );
  }

  return await next();
});
