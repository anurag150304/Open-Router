import { jwt } from "@elysia/jwt";

export const jwtPlugin = jwt({
  name: "jwt",
  secret: process.env.JWT_SECRET!,
});
