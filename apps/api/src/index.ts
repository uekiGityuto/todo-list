import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app";
import { logger } from "./shared/lib/logger";

const PORT = 3001;

serve({ fetch: app.fetch, port: PORT });

logger.info({ port: PORT }, "server started");
