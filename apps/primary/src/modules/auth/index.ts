import { Elysia } from "elysia";
import { AuthModel } from "./model.js";
import { Auth } from "./service.js";
import { jwtPlugin } from "../../plugins/jwt.plugin.js";

const createAuth = () =>
  new Elysia({ prefix: "auth" })
    .use(jwtPlugin)
    .post(
      "sign-up",
      async ({ body }) => {
        const { name, email, password } = body;
        const userId = await Auth.signup({ name, email, password });
        return {
          message: "User signed up sucessfully",
          userId: userId.toString(),
        };
      },
      {
        body: AuthModel.signUpBody,
        response: { 201: AuthModel.signUpResponse },
      },
    )
    .post(
      "sign-in",
      async ({ jwt, body, cookie: { auth } }) => {
        const { email, password } = body;

        const userId = await Auth.signin({ email, password });
        const value = await jwt.sign({ userId });

        auth?.set({
          value,
          httpOnly: true,
          maxAge: 7 * 86_400,
        });

        return {
          message: "Signed In sucessfully",
          userId: userId.toString(),
        };
      },
      {
        body: AuthModel.signInBody,
        response: { 200: AuthModel.signInResponse },
      },
    );
export const auth: any = createAuth();
