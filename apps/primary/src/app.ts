import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { auth as AuthRoute } from "./modules/auth/index.js";
import { MyError } from "./types/error.type.js";
import { apiRoute } from "./modules/api_key/index.js";
import { modelsRoute } from "./modules/models/index.js";

new Elysia({ adapter: node() })
  .get("/", () => "Hello Elysia")
  .use(AuthRoute)
  .use(apiRoute)
  .use(modelsRoute)
  .error({ MY_ERROR: MyError })
  .onError(({ code, error, status }) => {
    return code === "MY_ERROR"
      ? status(error.status, {
          message: error.message,
        })
      : error;
  })
  .listen(3000, ({ hostname, port }) => {
    console.log(`Server is running at ${hostname}:${port}`);
  });
