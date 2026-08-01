import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { env } from "@repo/env-config";
import { completionsSchema } from "./model.js";
import { cors } from "@elysia/cors";
import { MyError } from "primary/MyError";
import { CompletionsService } from "./service.js";
import { bearer } from "@elysia/bearer";
import type { CompletionResult } from "./LLMs/LLM.schema.js";

const app = new Elysia({ adapter: node(), prefix: "/api/v1" })
  .use(
    cors({
      origin: "*",
      methods: ["POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(bearer())
  .get("/", () => "Welcome to the Open-ROuter API server")
  .post(
    "/chat/completions",
    async ({ bearer: apiKey, body, set }) => {
      if (!apiKey) {
        throw new MyError(401, "Authorization Bearer header is missing.");
      }

      let userId: number;
      let cleanKey: string;

      try {
        const res = await CompletionsService.validateKey({
          authorization: apiKey,
        });

        if (!res) {
          throw new MyError(401, "Invalid key! Please generate a valid key.");
        }
        userId = res.userId;
        cleanKey = res.cleanKey;
      } catch (err) {
        if (err instanceof MyError) throw err;
        console.error("Key validation error:", err);
        throw new MyError(401, "Failed to validate your API key.");
      }

      // Check user credits before processing request
      await CompletionsService.checkUserCredits({ userId });

      try {
        const { model, messages, options, stream = false } = body;
        let usage: NonNullable<CompletionResult["usage"]> | null = null;

        if (!stream) {
          const res = await CompletionsService.chatCompletion({
            model,
            messages,
            options,
          });
          if (res.usage) usage = res.usage;

          const promptTokens = usage?.promptTokens || 0;
          const completionTokens = usage?.completionTokens || 0;

          await CompletionsService.storeConversation({
            apiKey: cleanKey,
            promptTokens,
            completionTokens,
          });

          await CompletionsService.deductCredits({
            userId,
            inputTokens: promptTokens,
            outputTokens: completionTokens,
          });

          set.status = "OK";
          return {
            model,
            choices: [
              {
                message: {
                  role: "assistant",
                  content: res.content,
                },
                usage,
              },
            ],
          };
        }

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of CompletionsService.chatCompletionStream(
                {
                  model,
                  messages,
                  options,
                  onUsage: (u) => (usage = u),
                },
              )) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text: chunk })}\n\n`,
                  ),
                );
              }

              if (usage) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ usage, done: true })}\n\n`,
                  ),
                );

                const promptTokens = usage.promptTokens || 0;
                const completionTokens = usage.completionTokens || 0;

                await CompletionsService.storeConversation({
                  apiKey: cleanKey,
                  promptTokens,
                  completionTokens,
                });

                await CompletionsService.deductCredits({
                  userId,
                  inputTokens: promptTokens,
                  outputTokens: completionTokens,
                });
              }
            } catch (err) {
              console.error("Stream execution error:", err);
              controller.error(err);
            } finally {
              controller.close();
            }
          },
        });

        set.status = "OK";
        return new Response(readable, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      } catch (err) {
        console.error("Chat completion route error:", err);
        if (err instanceof MyError) throw err;
        throw new MyError(
          500,
          err instanceof Error
            ? err.message
            : "An error occurred while generating completion.",
        );
      }
    },
    {
      headers: completionsSchema.headerSchema,
      body: completionsSchema.bodySchema,
    },
  )
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
        console.error("Unhandled API error:", error);
        set.status = 500;
        return {
          message: "Internal Server Error",
        };
      }
    }
  })
  .listen(env.API_PORT, ({ hostname, port }) => {
    console.log(`API server is running at ${hostname}:${port}`);
  });

export type App = typeof app;
