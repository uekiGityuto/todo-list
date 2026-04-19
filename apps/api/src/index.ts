import { serve } from "@hono/node-server";
import app from "./app";

const PORT = 3001;

serve({ fetch: app.fetch, port: PORT });
