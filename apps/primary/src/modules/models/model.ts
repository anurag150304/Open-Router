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
};

export type modelSchema = {
  [k in keyof typeof modelSchema]: UnwrapSchema<(typeof modelSchema)[k]>;
};
