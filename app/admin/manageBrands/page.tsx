"use client"

import dynamic from "next/dynamic"

const ManageBrandsClient = dynamic(() => import("./ManageBrandsClient"), {
  ssr: false,
})

export default function ManageBrandsPage() {
  return <ManageBrandsClient />
}
