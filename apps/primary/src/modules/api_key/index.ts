import { Elysia } from "elysia";
import { API_Model } from "./model.js";
import { API } from "./service.js";
import { jwtPlugin } from "../../plugins/jwt.plugin.js";

export const apiKey = new Elysia({ prefix: "api-key" })
    .use(jwtPlugin)
    .resolve(async ({ jwt, cookie: { auth }, set }) => {
        if (!auth?.value) {
            set.status = "Unauthorized";
            throw new Error("Unauthorized");
        }

        const decoded = await jwt.verify(auth.value as string);

        if (!decoded) {
            set.status = "Unauthorized";
            throw new Error("Unauthorized");
        }

        return {
            userId: Number(decoded.userId)
        };

    }).post("/create", async ({ userId, body, set }) => {

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
    .put("/disable", async ({ userId, body, set }) => {

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

        const allUserKey = await API.getAllUserKeys({ userId });
        set.status = "OK";
        return { keys: allUserKey };
    }, {
        response: API_Model.getAllUserKeysResponse
    })
    .delete("remove-key/:keyId", async ({ params, set }) => {
        const { keyId } = params;
        const res = await API.deleteAPIKey({ keyId });
        if (!res) {
            set.status = "Conflict"
            return {
                message: "Something went wrong! While deleting key",
            }
        };

        set.status = "OK";
        return {
            message: "Key deleted sucessfully",
            keyId: res.key_name,
            // key: res.key
        };

    }, {
        params: API_Model.deleteKeyParam,
        response: API_Model
    })