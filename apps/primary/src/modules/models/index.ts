import { Elysia } from "elysia";
import { Models } from "./service.js";
import { modelSchema } from "./model.js";

const createmodelRoute = () =>
  new Elysia({ prefix: "models" })
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
    .get(
      "/providers",
      async ({ set }) => {
        const providers = await Models.getAllProviders();

        set.status = "OK";
        return { providers };
      },
      {
        response: modelSchema.modelProvidersResponse,
      },
    );

export const modelsRoute = createmodelRoute();
