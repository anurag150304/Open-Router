import { env } from "@repo/env-config";
import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { auth as AuthRoute } from "./modules/auth/index.js";
import { MyError } from "./types/error.type.js";
import { apiRoute } from "./modules/api_key/index.js";
import { modelsRoute } from "./modules/models/index.js";
import { providersRoute } from "./modules/providers/index.js";
import { companiesRoute } from "./modules/modelOEMs/index.js";

new Elysia({ adapter: node() })
  .get("/", () => "Hello Elysia")
  .use(AuthRoute)
  .use(apiRoute)
  .use(modelsRoute)
  .use(providersRoute)
  .use(companiesRoute)
  .error({ MY_ERROR: MyError })
  .onError(({ code, error, status }) => {
    return code === "MY_ERROR"
      ? status(error.status, {
          message: error.message,
        })
      : error;
  })
  .listen(env.PORT, ({ hostname, port }) => {
    console.log(`Server is running at ${hostname}:${port}`);
  });
