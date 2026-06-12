import { jwt } from "@elysia/jwt";

export const jwtPlugin: any = jwt({
  name: "jwt",
  secret: process.env.JWT_SECRET!,
});
