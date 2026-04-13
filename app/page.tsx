'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/ventas') // puedes cambiar a /inventario si quieres
  }, [])

  return <p style={{ padding: 20 }}>Cargando...</p>
}