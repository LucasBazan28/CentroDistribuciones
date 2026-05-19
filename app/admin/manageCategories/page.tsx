"use client"

import dynamic from "next/dynamic"

const ManageCategoriesClient = dynamic(() => import("./ManageCategoriesClient"), {
  ssr: false,
})

export default function ManageCategoriesPage() {
  return <ManageCategoriesClient />
}
