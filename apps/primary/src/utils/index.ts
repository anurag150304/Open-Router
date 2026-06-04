import bcrypt from "bcrypt";
import crypto from "crypto";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswrod = async (hashed: string, pass: string) => {
  return await bcrypt.compare(pass, hashed);
};

const KEY_PREFIX = "sk-or-v1-";
export const generateKey = () => {
  const randomString = crypto.randomBytes(21).toString("base64url").slice(0, 41); // generates a 41-character string
  return `${KEY_PREFIX}${randomString}`;
}
