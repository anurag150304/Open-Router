import { prisma as DB } from "@repo/db-config/DB";
import type { providersSchema } from "./model.js";

export abstract class ProvidersModel {
  static async getAllProviders() {
    return await DB.providers.findMany({});
  }

  static async addNewProvider({
    name,
    website,
  }: providersSchema["newProviderBody"]) {
    return await DB.providers.create({
      data: { name, ...(website && { website }) },
    });
  }
}
