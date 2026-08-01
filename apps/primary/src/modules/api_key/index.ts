import { Elysia } from "elysia";
import { API_Model } from "./model.js";
import { API } from "./service.js";
import { jwtPlugin } from "../../plugins/jwt.plugin.js";
import { MyError } from "../../types/error.type.js";

export const apiRoute = new Elysia({ prefix: "/apikey" })
  .use(jwtPlugin)
  .resolve(async ({ jwt, cookie: { auth } }) => {
    if (!auth?.value) {
      throw new MyError(401, "Unauthorized access. Please log in.");
    }

    const decoded = await jwt.verify(auth.value as string);

    if (!decoded) {
      throw new MyError(401, "Unauthorized access. Invalid auth token.");
    }

    return {
      userId: Number(decoded.userId),
    };
  })
  .post(
    "/create",
    async ({ userId, body, set }) => {
      const { keyName, expiresOn } = body;
      const key = await API.checkKeyExistence({ userId, keyName });

      if (key) {
        throw new MyError(
          409,
          `Key with name '${keyName}' already exists. Please choose a unique name.`,
        );
      }

      const generatedKey = await API.createAPIKey({
        keyName,
        expiresOn,
        userId,
      });
      set.status = "Created";
      return {
        message: "Key generated successfully",
        key: generatedKey,
      };
    },
    {
      body: API_Model.keyCreationBody,
      response: API_Model.keyCreationResopnse,
    },
  )
  .put(
    "/update",
    async ({ userId, body, set }) => {
      const { keyName, key, updateType } = body;
      const keyExists = await API.checkKeyExistence({ keyName, userId });

      if (!keyExists) {
        throw new MyError(404, "API key not found.");
      }

      const res = await API.updateKey({ keyName, key, userId, updateType });
      if (!res) {
        throw new MyError(
          409,
          `Failed to ${updateType} the API key. Please try again later.`,
        );
      }

      set.status = "OK";
      return {
        message: `Key successfully ${updateType}d`,
        key: res,
      };
    },
    {
      body: API_Model.updateKeyBody,
      response: API_Model.updateKeyResponse,
    },
  )
  .get(
    "/all",
    async ({ userId, set }) => {
      const allUserKey = await API.getAllUserKeys({ userId });
      set.status = "OK";
      return { keys: allUserKey };
    },
    {
      response: API_Model.getAllUserKeysResponse,
    },
  )
  .delete(
    "/remove",
    async ({ query, set }) => {
      const { key } = query;
      const res = await API.deleteAPIKey({ key });
      if (!res) {
        throw new MyError(
          409,
          "Failed to delete API key. Key not found or already deleted.",
        );
      }

      set.status = "OK";
      return {
        message: "Key deleted successfully",
      };
    },
    {
      query: API_Model.deleteKeyQuery,
      response: API_Model.deleteKeyResponse,
    },
  );
