import { t, type UnwrapSchema } from "elysia";
import { prisma as DB } from "@repo/db-config/DB"

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
        message: t.String(),
        keys: t.Array(t.Object({
            id: t.Number(),
            key_name: t.String(),
            key: t.String(),
            active: t.Boolean(),
            userId: t.Number(),
            expires_at: t.Date()
        }))
    })
}

export type API_Model = {
    [k in keyof typeof API_Model]: UnwrapSchema<(typeof API_Model)[k]>
};