import { MyError } from "../../types/error.type.js";
import { comparePasswrod, hashPassword } from "../../utils/index.js";
import type { AuthModel } from "./model.js";
import { userDB } from "@repo/db-config";

export abstract class Auth {
  static async signup({ name, email, password }: AuthModel["signUpBody"]) {
    try {
      const isExist = await userDB.findFirst({ where: { email } });
      if (isExist) {
        throw new MyError(403, "User with this email already exists!");
      }
      const hashedPass = await hashPassword(password);
      const user = await userDB.create({
        data: { name, email, password: hashedPass },
      });

      return user.id.toString();
    } catch (err) {
      if (err instanceof MyError) throw err;
      console.error("Auth signup database error:", err);
      throw new MyError(500, "Database error during user signup.");
    }
  }

  static async signin({ email, password }: AuthModel["signInBody"]) {
    let user;
    try {
      user = await userDB.findFirst({ where: { email } });
    } catch (err) {
      console.error("Auth signin database error:", err);
      throw new MyError(500, "Database error during user signin.");
    }

    if (!user) throw new MyError(404, "User not found!");

    const isValid = await comparePasswrod(user.password, password);
    if (!isValid) throw new MyError(403, "Invalid credentials");
    return user.id.toString();
  }

  static async getMe(userId: string | number) {
    try {
      const user = await userDB.findUnique({
        where: { id: Number(userId) },
        select: { id: true, name: true, email: true, credits: true },
      });
      if (!user) throw new MyError(404, "User not found!");
      return user;
    } catch (err) {
      if (err instanceof MyError) throw err;
      console.error("Auth getMe database error:", err);
      throw new MyError(500, "Database error retrieving user details.");
    }
  }
}
