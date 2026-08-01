import { env } from "@repo/env-config";
import { Elysia } from "elysia";
import { cors } from "@elysia/cors";
import { user as userRoute } from "./modules/auth/index.js";
import { apiRoute } from "./modules/api_key/index.js";
import { modelsRoute } from "./modules/models/index.js";
import { companiesRoute } from "./modules/modelOEMs/index.js";
import { node } from "@elysia/node";
import { MyError } from "./types/error.type.js";

const app = new Elysia({ adapter: node(), prefix: "/primary/v1" })
  .use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .get("/", () => "Welcome to the Open-ROuter Primary server")
  .use(userRoute)
  .use(apiRoute)
  .use(modelsRoute)
  .use(companiesRoute)
  .error({ MyError })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "MyError": {
        set.status = (error as MyError).status;
        return {
          message: error.message,
        };
      }
      case "VALIDATION": {
        set.status = 400;
        return {
          message: "Validation failed",
          error: error.message,
        };
      }
      case "NOT_FOUND": {
        set.status = 404;
        return {
          message: "Resource not found",
        };
      }
      case "PARSE": {
        set.status = 400;
        return {
          message: "Malformed JSON payload",
          error: error.message,
        };
      }
      default: {
        console.error("Unhandled Primary API error:", error);
        set.status = 500;
        return {
          message: "Internal Server Error",
        };
      }
    }
  })
  .listen(env.PRIMARY_PORT, ({ hostname, port }) => {
    console.log(`Primary server is running at ${hostname}:${port}`);
  });

export type App = typeof app;
