import { Elysia } from "elysia";
import { Models } from "./service.js";
import { modelSchema } from "./model.js";

export const modelsRoute = new Elysia({ prefix: "/models" })
  .post(
    "/new",
    async ({ body, set }) => {
      const { name, companyId } = body;
      const model = await Models.addNewModel({ name, companyId });

      set.status = "Created";
      return {
        message: "Model added successfully",
        modelId: model.id,
      };
    },
    {
      body: modelSchema.newModelBody,
      response: modelSchema.newModelResponse,
    },
  )
  .get(
    "/all",
    async ({ set }) => {
      const models = await Models.getAllModels();
      set.status = "OK";
      return { models };
    },
    {
      response: modelSchema.allModelsResponse,
    },
  )
  .post(
    "/add-provider",
    async ({ body, set }) => {
      const modelProviderId = await Models.addModelProvider(body);
      set.status = "Created";
      return {
        message: "Model provider added",
        modelProviderId: modelProviderId.id,
      };
    },
    {
      body: modelSchema.modelProviderSchema,
      response: modelSchema.modelProviderResponse,
    },
  );
