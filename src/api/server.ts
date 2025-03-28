import { Hono } from "hono";
import { authMiddleware } from "./middlewares/auth";
import { errorMiddleware, loggerMiddleware } from "./middlewares/utilities";
import { devicesRoute } from "./routes/devices";
import { requestsRoute } from "./routes/requests";
import { settingsRoute } from "./routes/settings";
import { systemRoute } from "./routes/system";

export const apiServer = new Hono()
  .use(loggerMiddleware)
  .use(authMiddleware)
  .use(errorMiddleware)
  .route("/system", systemRoute)
  .route("/requests", requestsRoute)
  .route("/settings", settingsRoute)
  .route("/devices", devicesRoute);

export function initializeServer() {
  const PORT = process.env.PORT || 3000;

  Bun.serve({
    fetch: apiServer.fetch,
    port: PORT,
  });

  return PORT;
}
