import { t, type UnwrapSchema } from "elysia";

export const companySchema = {

    newCompanyBody: t.Object({
        name: t.String({ error: "Company name is required!" }),
        website: t.String({ error: "Company website is required!" }),
    }),

    newCompanyResponse: t.Object({
        message: t.String(),
        companyId: t.Optional(t.String())
    }),
}

export type companySchema = {
    [k in keyof typeof companySchema]: UnwrapSchema<(typeof companySchema)[k]>;
}