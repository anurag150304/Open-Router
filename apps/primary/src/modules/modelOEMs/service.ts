import { prisma as DB } from "@repo/db-config/DB";
import type { companySchema } from "./model.js";

export abstract class CompanyModel {
    static async addNewCompany({ name, website }: companySchema["newCompanyBody"]) {
        return await DB.companies.create({ data: { name, website } });
    }
}