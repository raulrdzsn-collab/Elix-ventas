'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'

export default function Header() {
  const router = useRouter()

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div
      style={{
        width: '100%',
        padding: '16px 20px',
        borderBottom: '1px solid #1f1f1f',
        background: '#0a0a0a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* LOGO */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 2,
          color: '#d9d9d9',
        }}
      >
        ELIXIA
      </div>

      {/* BOTONES */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => router.push('/ventas')}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #333',
            background: '#151515',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Ventas
        </button>

        <button
          onClick={() => router.push('/inventario')}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #333',
            background: '#151515',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Inventario
        </button>

        <button
          onClick={cerrarSesion}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #4a1f1f',
            background: '#1a1010',
            color: '#ffb4b4',
            cursor: 'pointer',
          }}
        >
          Salir
        </button>
      </div>
    </div>
  )
}