import { Elysia } from "elysia";
import { CompanyModel } from "./service.js";
import { companySchema } from "./model.js";

const createCompaniesRoute = () =>
  new Elysia({ prefix: "companies" })
    .post("/new", async ({ body, set }) => {
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
    )
    .get("/all", async ({ set }) => {
      const companies = await CompanyModel.getAllCompanies();
      set.status = "OK";
      return {
        message: "Companies retrieved successfully",
        companies,
      };
    }, {
      response: companySchema.allCompaniesResponse
    });

export const companiesRoute = createCompaniesRoute();
