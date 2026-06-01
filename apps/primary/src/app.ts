import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { auth as AuthRoute } from "./modules/auth/index.js";
import { MyError } from "./types/error.type.js";

const app = new Elysia({ adapter: node() })
  .get("/", () => "Hello Elysia")
  .use(AuthRoute)
  .error({ MY_ERROR: MyError })
  .onError(({ code, error, status }) => {
    console.log(code);
    return code === "MY_ERROR"
      ? status(error.status, {
          message: error.message,
        })
      : error;
  })
  .listen(3000, ({ hostname, port }) => {
    console.log(`Server is running at ${hostname}:${port}`);
  });
