import { Elysia } from "elysia";
import { CompanyModel } from "./service.js";
import { companySchema } from "./model.js";

const createCompaniesRoute = () =>
  new Elysia({ prefix: "companies" }).post(
    "/new",
    async ({ body, set }) => {
      const { name, website } = body;
      const company = await CompanyModel.addNewCompany({ name, website });
      set.status = "Created";
      return {
        message: "Company added successfully",
        companyId: company.id,
      };
    },
    {
      body: companySchema.newCompanyBody,
      response: companySchema.newCompanyResponse,
    },
  );

export const companiesRoute = createCompaniesRoute();
