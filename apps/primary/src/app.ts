import { env } from "@repo/env-config";
import { Elysia } from "elysia";
import { user as userRoute } from "./modules/auth/index.js";
import { apiRoute } from "./modules/api_key/index.js";
import { modelsRoute } from "./modules/models/index.js";
import { providersRoute } from "./modules/providers/index.js";
import { companiesRoute } from "./modules/modelOEMs/index.js";
import { node } from "@elysia/node";

const app = new Elysia({ adapter: node() })
  .get("/", () => "Hello Elysia")
  .use(userRoute)
  .use(apiRoute)
  .use(modelsRoute)
  .use(providersRoute)
  .use(companiesRoute)
  .listen(env.PORT, ({ hostname, port }) => {
    console.log(`Server is running at ${hostname}:${port}`);
  });

export type App = typeof app;
