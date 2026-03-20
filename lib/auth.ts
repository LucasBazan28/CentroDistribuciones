import { supabase } from "./supabaseClient"

export async function registerUser(
  email: string,
  password: string,
  nombre: string,
  apellido: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        nombre,
        apellido
      }
    }
  })

  if (error) throw error

  return data
}

export async function loginUser(
  email: string,
  password: string
) {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  return data
}

export async function logoutUser() {
  await supabase.auth.signOut()
}