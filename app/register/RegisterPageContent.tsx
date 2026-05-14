"use client";

import { useProtectAuthPages } from "@/lib/hooks/useProtectAuthPages";
import RegisterForm from "@/app/components/RegisterForm";

export default function RegisterPage() {
  useProtectAuthPages();

  return (
    <main>
      <RegisterForm />
    </main>
  );
}