import { t, type UnwrapSchema } from "elysia";

export const API_Model = {
    keyCreationBody: t.Object({
        keyName: t.String({ error: "Key name is required!" }),
        expiresOn: t.Union([t.String(), t.Date()], { error: "Expires on must be a valid date or string!" }),
    }),
    keyCreationResopnse: t.Object({
        message: t.String(),
        key: t.Union([t.String(), t.Null()])
    }),
    disableKeyBody: t.Object({
        keyName: t.String({ error: "Key name is required!" }),
        key: t.String({
            error: "Key is required!"
        })
    }),
    disableKeyResponse: t.Object({
        message: t.String(),
        key: t.Union([t.String(), t.Null()])
    }),
    getAllUserKeysResponse: t.Object({
        message: t.Optional(t.String()),
        keys: t.Array(t.Any())
    }),
    deleteKeyParam: t.Object({
        keyId: t.String()
    }),
    deleteKeyResponse: t.Object({
        message: t.String(),
        keyName: t.Object(t.String()),
        key: t.Optional(t.String())
    })
}

export type API_Model = {
    [k in keyof typeof API_Model]: UnwrapSchema<(typeof API_Model)[k]>
};