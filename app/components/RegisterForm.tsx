"use client"

import { useState } from "react"
import { registerUser } from "@/lib/auth"

export default function RegisterPage() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")

  const handleSubmit = async (e:any) => {
    e.preventDefault()

    try {

      await registerUser(email,password,nombre,apellido)

      alert("Usuario creado")

    } catch(err:any) {
      alert(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      <input placeholder="Nombre"
        onChange={e=>setNombre(e.target.value)}
      />

      <input placeholder="Apellido"
        onChange={e=>setApellido(e.target.value)}
      />

      <input placeholder="Email"
        onChange={e=>setEmail(e.target.value)}
      />

      <input type="password"
        placeholder="Password"
        onChange={e=>setPassword(e.target.value)}
      />

      <button type="submit">
        Registrarse
      </button>

    </form>
  )
}