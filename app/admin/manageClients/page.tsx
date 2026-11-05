"use client"

import dynamic from "next/dynamic"

const ManageClientsClient = dynamic(() => import("./ManageClientsClient"), {
  ssr: false,
})

export default function ManageClientsPage() {
  return <ManageClientsClient />
}
