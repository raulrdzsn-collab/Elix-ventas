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
        borderBottom: '1px solid #262626',
        background: '#0f0f0f',
        padding: '14px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
            color: '#c0c0c0',
            fontFamily: 'Georgia, Times New Roman, serif',
            textTransform: 'uppercase',
          }}
        >
          ELIXIA
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #333',
              background: '#151515',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Inicio
          </button>

          <button
            onClick={() => router.push('/ventas')}
            style={{
              padding: '10px 14px',
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
              padding: '10px 14px',
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
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #4a1f1f',
              background: '#1a1010',
              color: '#ffb4b4',
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}