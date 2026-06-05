import { Elysia } from "elysia";
import { API_Model } from "./model.js";
import { jwtPlugin } from "../../config/jwt.config.js";
import { API } from "./service.js";

export const apiKey = new Elysia({ prefix: "api-key" })
    .use(jwtPlugin)
    .resolve(async ({ cookie: { auth }, jwt }) => {
        if (!auth) return { userId: null };

        const decoded = await jwt.verify(auth.value as string)
        if (!decoded) return { userId: null }

        return { userId: Number(decoded.userId) }
    })
    .post("create", async ({ body, userId, set }) => {
        if (!userId) {
            set.status = "Unauthorized";
            return {
                message: "Unauthorized",
                key: null
            }
        }

        const { keyName, expiresOn } = body
        const key = await API.checkKeyExistence({ userId, keyName });

        if (key) {
            set.status = "Conflict";
            return {
                message: `Key with name: ${keyName} already exists. Try to make unique name`,
                key
            }
        }

        const generatedKey = await API.createAPIKey({ keyName, expiresOn, userId });
        set.status = "Created";
        return {
            message: "Key generated sucessfully",
            key: generatedKey
        }
    }, {
        body: API_Model.keyCreationBody,
        response: API_Model.keyCreationResopnse
    })
    .put("disable", async ({ body, userId, set }) => {
        if (!userId) {
            set.status = "Unauthorized";
            return {
                message: "Unauthorized",
                key: null
            }
        }

        const { keyName, key } = body
        const keyExists = await API.checkKeyExistence({ keyName, userId });

        if (!keyExists) {
            set.status = "Not Found";
            return {
                message: "key not found!",
                key: null
            }
        }

        const res = await API.disableKey({ keyName, key, userId });
        if (!res) {
            set.status = "Conflict";
            return {
                message: "Failed to disable the key. Please try again later.",
                key: null
            }
        }

        set.status = "OK";
        return {
            message: "Key sucessfully disabled",
            key: res
        }

    }, {
        body: API_Model.disableKeyBody,
        response: API_Model.disableKeyResponse
    })
    .get("all-keys", async ({ userId, set }) => {
        if (!userId) {
            set.status = "Unauthorized";
            return {
                message: "Unauthorized",
                key: null
            }
        }

        const allUserKey = await API
    }, {
        response: API_Model.getAllUserKeysResponse
    })