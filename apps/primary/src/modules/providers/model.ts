import { t, type UnwrapSchema } from "elysia";

export const providersSchema = {
  newProviderBody: t.Object({
    name: t.String({ error: "Provider Name is required!" }),
    website: t.Optional(t.String()),
  }),

  newProviderResponse: t.Object({
    message: t.String(),
    providerId: t.Optional(t.String()),
  }),

  allProvidersResponse: t.Object({
    providers: t.Array(t.Any()),
  }),
};

export type providersSchema = {
  [k in keyof typeof providersSchema]: UnwrapSchema<
    (typeof providersSchema)[k]
  >;
};
