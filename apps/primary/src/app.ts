import { env } from "@repo/env-config";
import { Elysia } from "elysia";
import { cors } from "@elysia/cors";
import { user as userRoute } from "./modules/auth/index.js";
import { apiRoute } from "./modules/api_key/index.js";
import { modelsRoute } from "./modules/models/index.js";
import { providersRoute } from "./modules/providers/index.js";
import { companiesRoute } from "./modules/modelOEMs/index.js";
import { node } from "@elysia/node";
import { MyError } from "./types/error.type.js";

const app = new Elysia({ adapter: node() })
  .use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .error({ MyError })
  .onError(({ code, error, set }) => {
    if (code === "MyError") {
      set.status = (error as MyError).status;
      return {
        message: error.message,
      };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        message: "Validation failed",
        error: error.message,
      };
    }
    console.error("Unhandled error:", error);
    set.status = 500;
    return {
      message: "Internal Server Error",
    };
  })
  .get("/", () => "Hello Elysia")
  .use(userRoute)
  .use(apiRoute)
  .use(modelsRoute)
  .use(providersRoute)
  .use(companiesRoute)
  .listen(env.PRIMARY_PORT, ({ hostname, port }) => {
    console.log(`Primary server is running at ${hostname}:${port}`);
  });

export type App = typeof app;
