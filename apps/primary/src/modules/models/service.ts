import { prisma as DB } from "@repo/db-config/DB";

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
    return await DB.providers.findMany();
  }
}
