"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { UserService } from "@/services/user-service";

export async function loginAction(_prevState, formData) {
  const payload = {
    username: String(formData.get("username") || ""),
    password: String(formData.get("password") || ""),
  };

  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      message: "Input login tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const userService = new UserService();
  const user = await userService.authenticateUser(parsed.data);

  if (!user) {
    return {
      success: false,
      message: "Username atau password salah.",
      errors: {},
    };
  }

  await createSession(user);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
