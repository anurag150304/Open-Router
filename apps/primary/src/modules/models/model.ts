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
  newCompanyBody: t.Object({
    name: t.String({ error: "Company name is required!" }),
    website: t.String({ error: "Company website is required!" }),
  }),
  newProviderBody: t.Object({
    name: t.String({ error: "Provider Name is required!" }),
    website: t.Optional(t.String()),
  }),
  newModelBody: t.Object({
    name: t.String({ error: "Model name is required!" }),
    companyId: t.String({ error: "Model's companyId is required!" }),
  }),
  newModelResponse: t.Object({
    message: t.String(),
    companyId: t.Optional(t.String()),
    providerId: t.Optional(t.String()),
    modelId: t.Optional(t.Any()),
  }),
};

export type modelSchema = {
  [k in keyof typeof modelSchema]: UnwrapSchema<(typeof modelSchema)[k]>;
};
