import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
}

export const comparePasswrod = async (hashed: string, pass: string) => {
    return await bcrypt.compare(pass, hashed)
}