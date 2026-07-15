import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { env } from "@repo/env-config";
import { completionsSchema } from "./model.js";
import { cors } from "@elysia/cors";
import { MyError } from "primary/MyError";
import { jwt } from "@elysia/jwt";
import { CompletionsService } from "./service.js";
import { bearer } from "@elysia/bearer";

const app = new Elysia({ adapter: node(), prefix: "/api/v1" })
  .use(
    cors({
      origin: "*",
      methods: ["POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )

  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    }),
  )
  .use(bearer())
  .get("/", () => "Welcome to the Open-ROuter API server")
  .post(
    "/chat/completions",
    async ({ bearer, body, set }) => {
      try {
        const res = await CompletionsService.validateKey({
          authorization: bearer as string,
        });

        if (!res) {
          set.status = "Unauthorized";
          return { message: "Invalid key! Please generate a valid key." };
        }
      } catch (err) {
        console.error(err);
        throw new MyError(
          401,
          "Something went wrong! While validating your key",
        );
      }

      try {
        const { model, messages } = body
        const res = await CompletionsService.LLMCall({ model, messages });
        set.status = "OK";
        return {
          model,
          choices: [{
            message: {
              role: "assistant",
              content: res.content
            },
            usage: {
              prompt_tokens: res.usage?.promptTokens || 0,
              completion_tokens: res.usage?.completionTokens || 0,
              total_tokens: res.usage?.totalTokenCount || 0,
              cost: 0,
            },
          }],

        }
      } catch (err) {
        console.error(err);
        throw new MyError(400, "Failed to generate content");
      }
    },
    {
      headers: completionsSchema.headerSchema,
      body: completionsSchema.bodySchema,
      // response: {
      //   200: completionsSchema.completionResponseSchema
      // }
    },
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
  .listen(env.API_PORT, ({ hostname, port }) => {
    console.log(`API server is running at ${hostname}:${port}`);
  });

export type App = typeof app;
