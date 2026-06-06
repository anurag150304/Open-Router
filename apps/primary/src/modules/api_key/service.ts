import { generateKey } from "../../utils/index.js";
import { API_Model } from "./model.js";
import { prisma as DB } from "@repo/db-config/DB"

export abstract class API {

    static async checkKeyExistence({ keyName, userId }: Omit<API_Model['keyCreationBody'], "expiresOn"> & { userId: number }) {
        const existKey = await DB.aPI_Key.findFirst({ where: { key_name: keyName, userId } })
        return existKey?.key;
    }

    static async createAPIKey({ keyName, expiresOn, userId }: API_Model['keyCreationBody'] & { userId: number }) {
        const newKey = generateKey();

        try {
            const apiKey = await DB.aPI_Key.create({
                data: {
                    key_name: keyName,
                    key: newKey,
                    user: { connect: { id: userId } },
                    expires_at: expiresOn as string
                }
            })
            return apiKey.key;
        } catch (err) {
            throw err;
        }
    }

    static async disableKey({ keyName, key, userId }: API_Model["disableKeyBody"] & { userId: number }) {
        try {
            const updatedKey = await DB.aPI_Key.update({
                where: {
                    key_name: keyName,
                    key,
                    userId
                },
                data: { active: false }
            });
            return updatedKey.key;
        } catch (err) {
            throw err;
        }
    }

    static async getAllUserKeys({ userId }: { userId: number }) {
        return DB.aPI_Key.findMany({
            where: {
                userId,
                deleted: false
            },
            select: {
                id: true,
                key_name: true,
                key: true,
                userId: true,
                active: true,
                expires_at: true
            }
        });
    }

    static async deleteAPIKey({ keyId }: API_Model["deleteKeyParam"]) {
        const res = await DB.aPI_Key.updateMany({ where: { id: keyId }, data: { deleted: true } });
        return Boolean(res.count);
    }
}