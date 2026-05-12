"use client";

import dynamic from "next/dynamic";

const RegisterPageContent = dynamic(() => import("./RegisterPageContent"), {
  ssr: false,
});

export default function RegisterPage() {
  return <RegisterPageContent />;
}
