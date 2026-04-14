'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'

type Producto = {
  id: number
  sku?: string
  nombre: string
  marca?: string
  presentacion?: string
  precio?: number
  stock_actual: number
}

type UsuarioActual = {
  id: string
  email?: string
}

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null)
  const [productId, setProductId] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [notas, setNotas] = useState('')
  const [mensaje, setMensaje] = useState('Cargando...')
  const [tipoMensaje, setTipoMensaje] = useState<'info' | 'success' | 'error'>(
    'info'
  )
  const [busqueda, setBusqueda] = useState('')
  const router = useRouter()

  useEffect(() => {
    const cargarTodo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUsuario({
        id: user.id,
        email: user.email,
      })

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) {
        setTipoMensaje('error')
        setMensaje(`Error cargando productos: ${error.message}`)
        return
      }

      setProductos(data || [])
      setTipoMensaje('info')
      setMensaje('')
    }

    cargarTodo()
  }, [router])

  useEffect(() => {
    if (!mensaje) return
    if (tipoMensaje !== 'success') return

    const timeout = setTimeout(() => {
      setMensaje('')
      setTipoMensaje('info')
    }, 3500)

    return () => clearTimeout(timeout)
  }, [mensaje, tipoMensaje])

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return productos.slice(0, 20)

    return productos
      .filter((p) =>
        `${p.nombre} ${p.presentacion || ''} ${p.sku || ''}`
          .toLowerCase()
          .includes(texto)
      )
      .slice(0, 20)
  }, [productos, busqueda])

  const productoSeleccionado = useMemo(() => {
    return productos.find((p) => p.id === Number(productId)) || null
  }, [productos, productId])

  const seleccionarProducto = (id: number) => {
    setProductId(String(id))
  }

  const limpiarSeleccion = () => {
    setProductId('')
    setBusqueda('')
  }

  const recargarProductos = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('nombre', { ascending: true })

    setProductos(data || [])
  }

  const guardarEntradaStock = async () => {
    setMensaje('')
    setTipoMensaje('info')

    if (!usuario) {
      setTipoMensaje('error')
      setMensaje('No hay usuario autenticado')
      return
    }

    const producto = productoSeleccionado

    if (!producto) {
      setTipoMensaje('error')
      setMensaje('Selecciona un producto')
      return
    }

    if (cantidad <= 0) {
      setTipoMensaje('error')
      setMensaje('La cantidad debe ser mayor a 0')
      return
    }

            const stockAnterior = producto.stock_actual
            const stockNuevo = stockAnterior + cantidad

            const { data: updatedRows, error: updateError } = await supabase
        .from('products')
        .update({ stock_actual: stockNuevo })
        .eq('id', producto.id)
        .select('id, stock_actual')

        if (updateError) {
        setTipoMensaje('error')
        setMensaje(`Error actualizando stock: ${updateError.message}`)
        return
        }

        if (!updatedRows || updatedRows.length === 0) {
        setTipoMensaje('error')
        setMensaje('No se pudo actualizar el stock en products')
        return
        }

    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert([
        {
          product_id: producto.id,
          user_id: usuario.id,
          user_email: usuario.email || null,
          movement_type: 'stock_in',
          quantity: cantidad,
          previous_stock: stockAnterior,
          new_stock: stockNuevo,
          notes: notas || null,
        },
      ])

    if (movementError) {
      setTipoMensaje('error')
      setMensaje(
        `Stock actualizado, pero error guardando movimiento: ${movementError.message}`
      )
      return
    }

    setTipoMensaje('success')
    setMensaje(
      `Stock actualizado | Código: ${producto.sku || 'N/A'} | Nuevo stock: ${stockNuevo}`
    )

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }

    setCantidad(1)
    setNotas('')
    setProductId('')
    setBusqueda('')

    await recargarProductos()
  }

  const obtenerEstiloMensaje = () => {
    if (tipoMensaje === 'success') {
      return {
        border: '1px solid #1f5130',
        background: '#0f1f17',
        color: '#4ade80',
      }
    }

    if (tipoMensaje === 'error') {
      return {
        border: '1px solid #5a1f1f',
        background: '#1f1111',
        color: '#f87171',
      }
    }

    return {
      border: '1px solid #2d2d2d',
      background: '#111',
      color: '#ddd',
    }
  }

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
          padding: 20,
          maxWidth: 760,
          margin: '0 auto',
          display: 'grid',
          gap: 18,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Alimentar stock</h1>
          {usuario && (
            <p style={{ color: '#aaa', margin: 0 }}>
              Usuario actual: {usuario.email}
            </p>
          )}
        </div>

        {mensaje && (
          <div
            style={{
              ...obtenerEstiloMensaje(),
              borderRadius: 12,
              padding: 12,
              fontWeight: 500,
            }}
          >
            {mensaje}
          </div>
        )}

        <div
          style={{
            border: '1px solid #262626',
            borderRadius: 16,
            padding: 18,
            background: '#111',
            display: 'grid',
            gap: 14,
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 14,
                color: '#bbb',
              }}
            >
              Buscar producto
            </label>
            <input
              placeholder="Ej. Good Girl, 30ml, A001..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
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

          {!productoSeleccionado && (
            <div
              style={{
                maxHeight: 280,
                overflowY: 'auto',
                border: '1px solid #2d2d2d',
                borderRadius: 12,
                background: '#0c0c0c',
              }}
            >
              {productosFiltrados.length === 0 ? (
                <div style={{ padding: 14, color: '#888' }}>
                  No se encontraron productos
                </div>
              ) : (
                productosFiltrados.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => seleccionarProducto(p.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: 14,
                      background: 'transparent',
                      color: 'white',
                      border: 'none',
                      borderBottom: '1px solid #1f1f1f',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                    <div style={{ color: '#aaa', fontSize: 14 }}>
                      {p.presentacion} | Código: {p.sku || 'N/A'} | Stock: {p.stock_actual}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {productoSeleccionado && (
            <div
              style={{
                border: '1px solid #2d2d2d',
                borderRadius: 14,
                padding: 16,
                background: '#0c0c0c',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'start',
                }}
              >
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                    {productoSeleccionado.nombre}
                  </div>
                  <div style={{ color: '#ccc', marginBottom: 4 }}>
                    Código: {productoSeleccionado.sku || 'N/A'}
                  </div>
                  <div style={{ color: '#ccc', marginBottom: 4 }}>
                    Presentación: {productoSeleccionado.presentacion}
                  </div>
                  <div style={{ color: '#ccc' }}>
                    Stock actual: {productoSeleccionado.stock_actual}
                  </div>
                </div>

                <button
                  onClick={limpiarSeleccion}
                  style={{
                    padding: '10px 12px',
                    background: '#1a1a1a',
                    color: 'white',
                    border: '1px solid #333',
                    borderRadius: 10,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Cambiar
                </button>
              </div>
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
              Cantidad a agregar
            </label>
            <input
              type="number"
              min={1}
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value || '1', 10))}
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
              Nota
            </label>
            <input
              placeholder="Ej. ingreso de proveedor, ajuste inicial..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
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
            onClick={guardarEntradaStock}
            style={{
              padding: 14,
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Guardar stock
          </button>
        </div>
      </div>
    </div>
  )
}