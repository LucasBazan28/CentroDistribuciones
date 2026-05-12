"use client";

import dynamic from "next/dynamic";

const ManageDiscountsContent = dynamic(
  () => import("./ManageDiscountsContent"),
  { ssr: false }
);

export default function ManageDiscountsPage() {
  return <ManageDiscountsContent />;
}
