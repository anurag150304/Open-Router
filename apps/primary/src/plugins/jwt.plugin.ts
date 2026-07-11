import { jwt } from "@elysia/jwt";
import { env } from "@repo/env-config";

export const jwtPlugin = jwt({
  name: "jwt",
  secret: env.JWT_SECRET,
});