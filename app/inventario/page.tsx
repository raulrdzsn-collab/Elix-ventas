'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'

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
        console.log('ERROR COMPLETO:', error)
        setMensaje(`Error: ${error.message}`)
        return
      }

      console.log('DATA OK:', data)

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
    <div style={{ padding: 20 }}>
      <h1>Inventario</h1>

      {mensaje && <p>{mensaje}</p>}

      <input
        placeholder="Buscar perfume..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ padding: 10, marginBottom: 20, width: '100%' }}
      />

      <div style={{ display: 'grid', gap: 10 }}>
        {productos
          .filter((p) =>
            p.nombre.toLowerCase().includes(busqueda.toLowerCase())
          )
          .map((p) => (
            <div
              key={p.id}
              style={{
                border: '1px solid #333',
                padding: 10,
                borderRadius: 8,
                background: '#111',
              }}
            >
              <strong>{p.nombre}</strong>
              <div>{p.presentacion}</div>
              <div>Stock: {p.stock_actual}</div>
              <div>Precio: ${p.precio ?? 0}</div>
            </div>
          ))}
      </div>
    </div>
  )
}