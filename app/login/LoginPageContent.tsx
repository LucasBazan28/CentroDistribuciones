"use client";

import { useProtectAuthPages } from "@/lib/hooks/useProtectAuthPages";
import LoginForm from "@/app/components/LoginForm";

export default function LoginPage() {
  useProtectAuthPages();

  return (
    <main>
      <LoginForm />
    </main>
  );
}