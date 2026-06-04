import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { auth as AuthRoute } from "./modules/auth/index.js";
import { MyError } from "./types/error.type.js";
import { apiKey } from "./modules/api_key/index.js";

new Elysia({ adapter: node() })
  .get("/", () => "Hello Elysia")
  .use(AuthRoute)
  .use(apiKey)
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
