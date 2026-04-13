'use client'

import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const iniciarSesion = async () => {
    setMensaje('')
    setCargando(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('LOGIN DATA:', data)
    console.log('LOGIN ERROR:', error)

    if (error) {
      setMensaje(`Error: ${error.message}`)
      setCargando(false)
      return
    }

    setCargando(false)
    router.push('/')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          border: '1px solid #262626',
          borderRadius: 20,
          padding: 24,
          background: '#111',
          display: 'grid',
          gap: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 32 }}>Iniciar sesión</h1>
          <p style={{ marginTop: 8, color: '#aaa' }}>
            Acceso al sistema ELIXIA
          </p>
        </div>

        {mensaje && (
          <div
            style={{
              border: '1px solid #5a1f1f',
              background: '#1f1111',
              color: '#f87171',
              borderRadius: 12,
              padding: 12,
            }}
          >
            {mensaje}
          </div>
        )}

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              color: '#bbb',
            }}
          >
            Correo
          </label>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: '1px solid #333',
              background: '#0c0c0c',
              color: 'white',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              color: '#bbb',
            }}
          >
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: '1px solid #333',
              background: '#0c0c0c',
              color: 'white',
              outline: 'none',
            }}
          />
        </div>

        <button
          onClick={iniciarSesion}
          disabled={cargando}
          style={{
            padding: 16,
            borderRadius: 14,
            border: 'none',
            background: '#ffffff',
            color: '#000',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            marginTop: 4,
            opacity: cargando ? 0.7 : 1,
          }}
        >
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}