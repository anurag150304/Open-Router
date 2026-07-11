import { service } from "../config/elisya.config";

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return await service.user.signup.post(payload);
}

export async function signin(payload: { email: string; password: string }) {
  return await service.user.signin.post(payload);
}
