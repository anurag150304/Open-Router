import { companiesDB } from "@repo/db-config";
import type { companySchema } from "./model.js";

export abstract class CompanyModel {
  static async addNewCompany({
    name,
    website,
  }: companySchema["newCompanyBody"]) {
    return await companiesDB.create({ data: { name, website } });
  }

  static async getAllCompanies() {
    return await companiesDB.findMany({});
  }
}
