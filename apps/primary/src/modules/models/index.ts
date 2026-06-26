import { Elysia } from "elysia";
import { Models } from "./service.js";
import { modelSchema } from "./model.js";

const createmodelRoute = () =>
  new Elysia({ prefix: "models" })
    .post(
      "/company/new",
      async ({ body, set }) => {
        const { name, website } = body;
        const company = await Models.addNewCompany({ name, website });
        set.status = "Created";
        return {
          message: "Company added successfully",
          companyId: company.id,
        };
      },
      {
        body: modelSchema.newCompanyBody,
        response: modelSchema.newModelResponse,
      },
    )
    .post(
      "/provider/new",
      async ({ body, set }) => {
        const { name, website } = body;
        const provider = await Models.addNewProvider({ name, website });

        set.status = "Created";
        return {
          message: "Provider added successfully",
          providerId: provider.id,
        };
      },
      {
        body: modelSchema.newProviderBody,
        response: modelSchema.newModelResponse,
      },
    )
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
    .post("/providers/new", ({}) => {})
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
