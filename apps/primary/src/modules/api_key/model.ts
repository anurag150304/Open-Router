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
    updateKeyBody: t.Object({
        keyName: t.String({ error: "Key name is required!" }),
        key: t.String({
            error: "Key is required!"
        }),
        updateType: t.UnionEnum(["disable", "enable"])
    }),
    updateKeyResponse: t.Object({
        message: t.String(),
        key: t.Union([t.String(), t.Null()])
    }),
    getAllUserKeysResponse: t.Object({
        message: t.Optional(t.String()),
        keys: t.Array(t.Object({
            active: t.Boolean(),
            expires_at: t.String(),
            id: t.String(),
            key: t.String(),
            key_name: t.String(),
            userId: t.Number()
        }))
    }),
    deleteKeyParam: t.Object({
        keyId: t.String()
    }),
    deleteKeyResponse: t.Object({
        message: t.String(),
        keyId: t.Optional(t.String())
    })
}

export type API_Model = {
    [k in keyof typeof API_Model]: UnwrapSchema<(typeof API_Model)[k]>
};