'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'
import Header from '../components/Header'

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  useEffect(() => {
    const verificarSesion = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setEmail(user.email || '')
    }

    verificarSesion()
  }, [router])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'white',
      }}
    >
      <Header />

      <div
        style={{
          minHeight: 'calc(100vh - 80px)',
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
            gap: 18,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 32 }}>ELIXIA</h1>
            <p style={{ marginTop: 8, color: '#aaa' }}>Panel principal</p>
            {email && (
              <p style={{ marginTop: 6, color: '#888', fontSize: 14 }}>
                {email}
              </p>
            )}
          </div>

          <button
            onClick={() => router.push('/ventas')}
            style={{
              padding: 16,
              borderRadius: 14,
              border: 'none',
              background: '#ffffff',
              color: '#000',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Ir a Ventas
          </button>

          <button
            onClick={() => router.push('/inventario')}
            style={{
              padding: 16,
              borderRadius: 14,
              border: '1px solid #333',
              background: '#1a1a1a',
              color: 'white',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Ver Inventario
          </button>
        </div>
      </div>
    </div>
  )
}