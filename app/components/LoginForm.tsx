"use client"

import { useState } from "react"
import { loginUser } from "@/lib/auth"

export default function LoginPage() {

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const handleLogin = async (e:any)=>{

    e.preventDefault()

    try{

      await loginUser(email,password)

      alert("Login correcto")

    }catch(err:any){
      alert(err.message)
    }
  }

  return(

    <form onSubmit={handleLogin}>

      <input
        placeholder="Email"
        onChange={e=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e=>setPassword(e.target.value)}
      />

      <button type="submit">
        Login
      </button>

    </form>

  )
}