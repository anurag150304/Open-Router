import { t } from "elysia";

export const completionsSchema = {
    headerSchema: t.Object({
        authorization: t.String(),
        "Content-Type": t.Literal("application/json"),
    }),
    // bodySchema: t.Object({
    //     model: 
    // })
}