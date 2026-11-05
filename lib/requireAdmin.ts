import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "./supabaseServer"

// Returns a Supabase client when the current user is an admin,
// or an error response to return from the route handler otherwise.
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { supabase, errorResponse: NextResponse.json({ error: "No autorizado" }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError || profile?.rol !== "admin") {
    return { supabase, errorResponse: NextResponse.json({ error: "Acceso solo para administradores" }, { status: 403 }) }
  }

  return { supabase, errorResponse: null }
}
