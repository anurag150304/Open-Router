import { providersDB } from "@repo/db-config";
import type { providersSchema } from "./model.js";

export abstract class ProvidersModel {
  static async getAllProviders() {
    return await providersDB.findMany({});
  }

  static async addNewProvider({
    name,
    website,
  }: providersSchema["newProviderBody"]) {
    return await providersDB.create({
      data: { name, ...(website && { website }) },
    });
  }
}
