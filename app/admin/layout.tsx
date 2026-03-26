import { redirect } from "next/navigation"
//import { supabase } from "@/lib/supabaseClient"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  // 1. Get the current user session
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // 2. Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    console.error("Error fetching profile from perfiles:", profileError)
    redirect("/")
  }

  if (!profile) {
    console.warn("No profile row found in perfiles for user id:", user.id)
    redirect("/")
  }

  if (profile?.rol !== "admin") {
    console.log("User is not an admin, redirecting to home.")
    redirect("/") // or redirect to an "unauthorized" page
  }

  // 3. If admin, render the admin pages
  return <>{children}</>
}