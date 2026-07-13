import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { env } from "@repo/env-config";

new Elysia({ adapter: node() })
  .get("/api/v1", () => "Welcome to the Open-ROuter API server")
  .get("/api/v1/chat/completions", () => {})
  .listen(env.API_PORT, ({ hostname, port }) => {
    console.log(`API server is running at ${hostname}:${port}`);
  });
