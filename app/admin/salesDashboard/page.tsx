"use client"

import dynamic from "next/dynamic"

const SalesDashboardClient = dynamic(() => import("./SalesDashboardClient"), {
  ssr: false,
})

export default function SalesDashboardPage() {
  return <SalesDashboardClient />
}
