import { modelsDB, modelProvidersDB } from "@repo/db-config";
import type { modelSchema } from "./model.js";

export abstract class Models {
  static async getAllModels() {
    return await modelsDB.findMany({
      select: {
        id: true,
        name: true,
        company: true,
        modelProviders: true,
      },
    });
  }

  static async addNewModel({ name, companyId }: modelSchema["newModelBody"]) {
    return await modelsDB.create({
      data: { name, company: { connect: { id: companyId } } },
    });
  }

  static async addModelProvider({
    modelId,
    providerId,
    inputToken_cost,
    outputToken_cost,
  }: modelSchema["modelProviderSchema"]) {
    return await modelProvidersDB.create({
      data: {
        inputToken_cost,
        outputToken_cost,
        model: { connect: { id: modelId } },
        provider: { connect: { id: providerId } },
      },
    });
  }
}
