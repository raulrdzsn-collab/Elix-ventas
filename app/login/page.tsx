'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()

  const iniciarSesion = async () => {
    setMensaje('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMensaje(`Error: ${error.message}`)
      return
    }

    router.push('/ventas')
  }

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h1>Iniciar sesión</h1>

      {mensaje && <p>{mensaje}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10 }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10 }}
        />

        <button
          onClick={iniciarSesion}
          style={{
            padding: 12,
            background: '#222',
            color: 'white',
            border: '1px solid #444',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Entrar
        </button>
      </div>
    </div>
  )
}