import { Elysia } from "elysia";
import { AuthModel } from "./model.js";
import { Auth } from "./service.js";
import { jwtPlugin } from "../../plugins/jwt.plugin.js";

export const user = new Elysia({ prefix: "/user" })
  .use(jwtPlugin)
  .post(
    "/sign-up",
    async ({ body }) => {
      const { name, email, password } = body;
      const userId = await Auth.signup({ name, email, password });
      return {
        message: "User account created sucessfully",
        userId: userId,
      };
    },
    {
      body: AuthModel.signUpBody,
      response: { 201: AuthModel.signUpResponse },
    },
  )
  .post(
    "/sign-in",
    async ({ jwt, body, cookie: { auth } }) => {
      const { email, password } = body;

      const userId = await Auth.signin({ email, password });
      const value = await jwt.sign({ userId });

      auth?.set({
        value: value,
        httpOnly: true,
        maxAge: 7 * 86_400,
        path: "/",
      });

      return {
        message: "Signed In sucessfully",
        userId: userId,
      };
    },
    {
      body: AuthModel.signInBody,
      response: { 200: AuthModel.signInResponse },
    },
  )
  .get(
    "/me",
    async ({ jwt, cookie: { auth } }) => {
      if (!auth?.value) {
        throw new Error("Unauthorized");
      }
      const decoded = await jwt.verify(auth.value as string);
      if (!decoded) {
        throw new Error("Unauthorized");
      }
      const userDetails = await Auth.getMe(decoded.userId as string);
      return {
        user: userDetails,
      };
    },
    {
      response: { 200: AuthModel.meResponse },
    },
  )
  .post(
    "/sign-out",
    async ({ cookie: { auth } }) => {
      auth?.remove();
      return {
        message: "Signed out successfully",
      };
    },
    {
      response: { 200: AuthModel.signOutResponse },
    },
  );
