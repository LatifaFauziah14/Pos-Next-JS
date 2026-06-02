"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <FormSection
      title="Autentikasi Pengguna"
      description="Validasi client dan server aktif untuk menjaga input tetap aman."
    >
      <form action={formAction} className="grid gap-4">
        <Input
          name="username"
          label="Username"
          placeholder="Masukkan username"
          autoComplete="username"
          error={state.errors?.username?.[0]}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          placeholder="Masukkan password"
          autoComplete="current-password"
          error={state.errors?.password?.[0]}
          helperText="Demo: admin / admin123"
        />
        {state.message ? (
          <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Memproses..." : "Masuk Sekarang"}
        </Button>
      </form>
    </FormSection>
  );
}
