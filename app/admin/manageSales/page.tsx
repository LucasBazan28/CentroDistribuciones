"use client"

import dynamic from "next/dynamic"

const ManageSalesClient = dynamic(() => import("./ManageSalesClient"), {
  ssr: false,
})

export default function ManageSalesPage() {
  return <ManageSalesClient />
}
