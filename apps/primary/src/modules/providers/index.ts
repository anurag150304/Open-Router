import { Elysia } from "elysia";
import { ProvidersModel } from "./service.js";
import { providersSchema } from "./model.js";

export const providersRoute = new Elysia({ prefix: "/providers" })
  .post(
    "/new",
    async ({ body, set }) => {
      const { name, website } = body;
      const provider = await ProvidersModel.addNewProvider({ name, website });

      set.status = "Created";
      return {
        message: "Provider added successfully",
        providerId: provider.id,
      };
    },
    {
      body: providersSchema.newProviderBody,
      response: providersSchema.newProviderResponse,
    },
  )
  .get(
    "/all",
    async ({ set }) => {
      const providers = await ProvidersModel.getAllProviders();

      set.status = "OK";
      return { providers };
    },
    {
      response: providersSchema.allProvidersResponse,
    },
  );
