import { t, type UnwrapSchema } from "elysia";

export const API_Model = {
    keyCreationBody: t.Object({
        keyName: t.String({ error: "Key name is required!" }),
        expiresOn: t.Union([t.String(), t.Date()], { error: "Expires on must be a valid date or string!" }),
    }),
    keyCreationResopnse: t.Object({
        message: t.String(),
        key: t.Union([t.String({ minLength: 50 }), t.Null()])
    }),
    disableKeyBody: t.Object({
        keyName: t.String({ error: "Key name is required!" }),
        key: t.String({
            error: "Key is required!",
            minLength: 50
        })
    }),
    disableKeyResponse: t.Object({
        message: t.String(),
        key: t.String()
    })
}

export type API_Model = {
    [k in keyof typeof API_Model]: UnwrapSchema<(typeof API_Model)[k]>
};