'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import Header from '../../components/Header'

type Producto = {
  id: number
  nombre: string
  stock_actual: number
  presentacion?: string
  precio?: number
}

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState('Cargando...')

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')

      if (error) {
        setMensaje(`Error: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        setMensaje('No hay productos para mostrar')
        return
      }

      setProductos(data)
      setMensaje('')
    }

    fetchProductos()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
      <Header />

      <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
        <h1>Inventario</h1>

        {mensaje && <p>{mensaje}</p>}

        <input
          placeholder="Buscar perfume..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: 12,
            marginBottom: 20,
            width: '100%',
            borderRadius: 10,
            border: '1px solid #333',
            background: '#111',
            color: 'white',
          }}
        />

        <div style={{ display: 'grid', gap: 12 }}>
          {productos
            .filter((p) =>
              p.nombre.toLowerCase().includes(busqueda.toLowerCase())
            )
            .map((p) => (
              <div
                key={p.id}
                style={{
                  border: '1px solid #262626',
                  padding: 14,
                  borderRadius: 14,
                  background: '#111',
                }}
              >
                <strong style={{ fontSize: 16 }}>{p.nombre}</strong>

                {p.presentacion && (
                  <div style={{ color: '#aaa' }}>{p.presentacion}</div>
                )}

                <div style={{ marginTop: 4 }}>
                  Stock: {p.stock_actual}
                </div>

                {p.precio && (
                  <div style={{ color: '#d4d4d4' }}>
                    Precio: ${p.precio}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}