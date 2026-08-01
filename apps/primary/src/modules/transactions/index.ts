import { Elysia } from "elysia";
import { MyError } from "../../types/error.type.js";
import { jwtPlugin } from "../../plugins/jwt.plugin.js";

export const paymentsRoute = new Elysia({ prefix: "/payments" })
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
    .post("/create", async() => {
        
    })