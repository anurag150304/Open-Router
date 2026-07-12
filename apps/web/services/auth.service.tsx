import { service } from "../config/elisya.config";

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const { data, error } = await service.user.signup.post(payload);
  if (error) {
    const errMsg =
      (error.value as any)?.message || "Signup failed. Please try again.";
    throw new Error(errMsg);
  }
  return data;
}

export async function signin(payload: { email: string; password: string }) {
  const { data, error } = await service.user.signin.post(payload);
  if (error) {
    const errMsg =
      (error.value as any)?.message || "Signin failed. Invalid credentials.";
    throw new Error(errMsg);
  }
  return data;
}

export async function getMe() {
  const { data, error } = await service.user.me.get();
  if (error) {
    const errMsg =
      (error.value as any)?.message || "Failed to fetch user profile.";
    throw new Error(errMsg);
  }
  return data;
}

export async function signout() {
  const { data, error } = await service.user.signout.post();
  if (error) {
    const errMsg = (error.value as any)?.message || "Failed to sign out.";
    throw new Error(errMsg);
  }
  return data;
}
