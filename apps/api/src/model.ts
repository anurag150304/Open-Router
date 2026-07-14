import { t, type UnwrapSchema } from "elysia";

export const completionsSchema = {
  headerSchema: t.Object({
    authorization: t.String(),
    "content-type": t.Literal("application/json"),
  }),
  bodySchema: t.Object({
    model: t.String(),
    messages: t.Array(t.Object({
      role: t.Enum({ user: "user", assistant: "assistant", system: "system" }),
      content: t.String()
    }))
  }),
  validationResponse: t.Object({
    message: t.String()
  }),

  completionResponseSchema: t.Object({
    model: t.String(),
    choices: t.Array(t.Object({
      message: t.Object({
        role: t.String(),
        content: t.String()
      })
    })),
    usage: t.Object({
      prompt_tokens: t.Number(),
      completion_tokens: t.Number(),
      total_tokens: t.Number(),
      cost: t.Number(),
    })
  })
};

export type completionsSchema = {
  [k in keyof typeof completionsSchema]: UnwrapSchema<(typeof completionsSchema)[k]>;
};
