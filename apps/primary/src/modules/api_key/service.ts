import { generateKey } from "../../utils/index.js";
import { API_Model } from "./model.js";
import { apiDB } from "@repo/db-config";
import { MyError } from "../../types/error.type.js";

export abstract class API {
  static async checkKeyExistence({
    keyName,
    userId,
  }: Omit<API_Model["keyCreationBody"], "expiresOn"> & { userId: number }) {
    try {
      const existKey = await apiDB.findFirst({
        where: { key_name: keyName, userId },
      });
      return existKey?.key;
    } catch (err) {
      console.error("Database error checking key existence:", err);
      throw new MyError(500, "Database error checking API key existence.");
    }
  }

  static async createAPIKey({
    keyName,
    expiresOn,
    userId,
  }: API_Model["keyCreationBody"] & { userId: number }) {
    const newKey = generateKey();

    try {
      const apiKey = await apiDB.create({
        data: {
          key_name: keyName,
          key: newKey,
          user: { connect: { id: userId } },
          expires_at: expiresOn as string,
        },
      });
      return apiKey.key;
    } catch (err) {
      console.error("Database error creating API key:", err);
      throw new MyError(500, "Database error creating new API key.");
    }
  }

  static async updateKey({
    keyName,
    key,
    updateType,
    userId,
  }: API_Model["updateKeyBody"] & { userId: number }) {
    try {
      const updatedKey = await apiDB.update({
        where: {
          key_name: keyName,
          key,
          userId,
        },
        data: { active: updateType == "disable" ? false : true },
      });
      return updatedKey.key;
    } catch (err) {
      console.error("Database error updating API key:", err);
      throw new MyError(500, "Database error updating API key.");
    }
  }

  static async getAllUserKeys({ userId }: { userId: number }) {
    try {
      return await apiDB.findMany({
        where: {
          userId,
          deleted: false,
        },
        select: {
          id: true,
          key_name: true,
          key: true,
          userId: true,
          active: true,
          expires_at: true,
        },
      });
    } catch (err) {
      console.error("Database error retrieving user API keys:", err);
      throw new MyError(500, "Database error retrieving user API keys.");
    }
  }

  static async deleteAPIKey({ key }: API_Model["deleteKeyQuery"]) {
    try {
      const res = await apiDB.updateMany({
        where: { key },
        data: { deleted: true },
      });
      return Boolean(res.count);
    } catch (err) {
      console.error("Database error deleting API key:", err);
      throw new MyError(500, "Database error deleting API key.");
    }
  }
}

