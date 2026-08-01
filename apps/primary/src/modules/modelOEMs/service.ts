import { companiesDB } from "@repo/db-config";
import type { companySchema } from "./model.js";
import { MyError } from "../../types/error.type.js";

export abstract class CompanyModel {
  static async addNewCompany({
    name,
    website,
  }: companySchema["newCompanyBody"]) {
    try {
      return await companiesDB.create({
        data: {
          name: name.toLowerCase(),
          ...(website && { website: website.toLowerCase() }),
        },
      });
    } catch (err) {
      console.error("Database error adding new company:", err);
      throw new MyError(500, "Database error occurred while adding new company.");
    }
  }

  static async getAllCompanies() {
    try {
      return await companiesDB.findMany({});
    } catch (err) {
      console.error("Database error retrieving companies:", err);
      throw new MyError(500, "Database error occurred while retrieving companies.");
    }
  }
}

