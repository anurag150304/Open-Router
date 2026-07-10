import { t, type UnwrapSchema } from "elysia";

export const modelSchema = {
  allModelsResponse: t.Object({
    models: t.Array(t.Any()),
  }),

  modelProvidersBody: t.Object({
    modelId: t.String(),
  }),

  modelProvidersResponse: t.Object({
    providers: t.Array(t.Any()),
  }),

  newModelBody: t.Object({
    name: t.String({ error: "Model name is required!" }),
    companyId: t.String({ error: "Model's companyId is required!" }),
  }),

  newModelResponse: t.Object({
    message: t.String(),
    modelId: t.Optional(t.Any()),
  }),

  modelProviderSchema: t.Object({
    modelId: t.String({ error: "Model Id is required!" }),
    providerId: t.String({ error: "Provider Id is required!" }),
    inputToken_cost: t.Number({ error: "Input token is required!" }),
    outputToken_cost: t.Number({ error: "Output token is required!" }),
  }),

  modelProviderResponse: t.Object({
    message: t.String(),
    modelProviderId: t.String(),
  }),
};

export type modelSchema = {
  [k in keyof typeof modelSchema]: UnwrapSchema<(typeof modelSchema)[k]>;
};
