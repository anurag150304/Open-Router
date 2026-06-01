import { MyError } from "../../types/error.type.js";
import { comparePasswrod, hashPassword } from "../utils/index.js";
import type { AuthModel } from "./model.js";
import { prisma as DB } from "@repo/db-config/DB";

export abstract class Auth {
  static async signup({ name, email, password }: AuthModel["signUpBody"]) {
    const isExist = await DB.user.findFirst({ where: { email } });
    if (isExist) {
      throw new MyError(403, "User with this email already exists!");
    }
    const hashedPass = await hashPassword(password);
    const user = await DB.user.create({
      data: { name, email, password: hashedPass },
    });

    return user.id.toString();
  }

  static async signin({ email, password }: AuthModel["signInBody"]) {
    const user = await DB.user.findFirst({ where: { email } });
    if (!user) throw new MyError(404, "User not found!");

    const isValid = await comparePasswrod(user.password, password);
    if (!isValid) throw new MyError(403, "Invalid credentials");
    return user.id.toString();
  }
}
