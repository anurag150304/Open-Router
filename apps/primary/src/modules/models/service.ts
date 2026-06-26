import { prisma as DB } from "@repo/db-config/DB";
import type { modelSchema } from "./model.js";

export abstract class Models {
  static async getAllModels() {
    return await DB.models.findMany({
      select: {
        name: true,
        company: true,
        modelProviders: true,
      },
    });
  }

  static async getAllProviders() {
    return await DB.providers.findMany({});
  }

  static async addNewCompany({ name, website }: modelSchema["newCompanyBody"]) {
    return await DB.companies.create({ data: { name, website } });
  }

  static async addNewProvider({
    name,
    website,
  }: modelSchema["newProviderBody"]) {
    return await DB.providers.create({
      data: { name, ...(website && { website }) },
    });
  }

  static async addNewModel({ name, companyId }: modelSchema["newModelBody"]) {
    return await DB.models.create({
      data: { name, company: { connect: { id: companyId } } },
    });
  }
}
