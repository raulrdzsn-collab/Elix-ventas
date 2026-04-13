'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

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

export default function VentasPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null)
  const [productId, setProductId] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [mensaje, setMensaje] = useState('Cargando...')
  const [tipoMensaje, setTipoMensaje] = useState<'info' | 'success' | 'error'>('info')
  const [totalHoy, setTotalHoy] = useState(0)
  const [totalHistorico, setTotalHistorico] = useState(0)
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

      const { data: productosData, error: productosError } = await supabase
        .from('products')
        .select('*')
        .order('nombre', { ascending: true })

      if (productosError) {
        setTipoMensaje('error')
        setMensaje(`Error cargando productos: ${productosError.message}`)
        return
      }

      setProductos(productosData || [])
      setTipoMensaje('info')
      setMensaje('')

      const { data: ventasData, error: ventasError } = await supabase
        .from('sales')
        .select('total, created_at')

      if (!ventasError && ventasData) {
        const hoy = new Date()
        const inicioDia = new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate()
        )

        const historico = ventasData.reduce(
          (acc, venta) => acc + Number(venta.total || 0),
          0
        )

        const hoyTotal = ventasData
          .filter((venta) => new Date(venta.created_at) >= inicioDia)
          .reduce((acc, venta) => acc + Number(venta.total || 0), 0)

        setTotalHistorico(historico)
        setTotalHoy(hoyTotal)
      }
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
        `${p.nombre} ${p.presentacion || ''}`
          .toLowerCase()
          .includes(texto)
      )
      .slice(0, 20)
  }, [productos, busqueda])

  const productoSeleccionado = useMemo(() => {
    return productos.find((p) => p.id === Number(productId)) || null
  }, [productos, productId])

  const recargarProductosYTotales = async () => {
    const { data: productosData } = await supabase
      .from('products')
      .select('*')
      .order('nombre', { ascending: true })

    setProductos(productosData || [])

    const { data: ventasData } = await supabase
      .from('sales')
      .select('total, created_at')

    if (ventasData) {
      const hoy = new Date()
      const inicioDia = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
      )

      const historico = ventasData.reduce(
        (acc, venta) => acc + Number(venta.total || 0),
        0
      )

      const hoyTotal = ventasData
        .filter((venta) => new Date(venta.created_at) >= inicioDia)
        .reduce((acc, venta) => acc + Number(venta.total || 0), 0)

      setTotalHistorico(historico)
      setTotalHoy(hoyTotal)
    }
  }

  const seleccionarProducto = (id: number) => {
    setProductId(String(id))
  }

  const limpiarSeleccion = () => {
    setProductId('')
    setBusqueda('')
  }

  const registrarVenta = async () => {
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

    if (cantidad > producto.stock_actual) {
      setTipoMensaje('error')
      setMensaje('No hay suficiente inventario disponible')
      return
    }

    const precioUnitario = Number(producto.precio || 0)
    const total = precioUnitario * cantidad
    const nuevoStock = producto.stock_actual - cantidad

    const { error: salesError } = await supabase
      .from('sales')
      .insert([
        {
          product_id: producto.id,
          seller_id: usuario.id,
          seller_email: usuario.email || null,
          seller_name: usuario.email || 'Usuario',
          client_name: clientName || null,
          client_phone: clientPhone || null,
          cantidad,
          precio_unitario: precioUnitario,
          total,
        },
      ])

    if (salesError) {
      setTipoMensaje('error')
      setMensaje(`Error guardando venta: ${salesError.message}`)
      return
    }

    const { error: stockError } = await supabase
      .from('products')
      .update({ stock_actual: nuevoStock })
      .eq('id', producto.id)

    if (stockError) {
      setTipoMensaje('error')
      setMensaje(`Venta guardada, pero error actualizando inventario: ${stockError.message}`)
      return
    }

    setTipoMensaje('success')
    setMensaje(
    `Venta registrada ✔ | Código: ${producto.sku || 'N/A'} | Stock restante: ${nuevoStock}`
    )

// 🔥 Vibración en móvil
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([100, 50, 100]) // vibra-pausa-vibra
    }

    setProductId('')
    setCantidad(1)
    setClientName('')
    setClientPhone('')
    setBusqueda('')

    await recargarProductosYTotales()
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          display: 'grid',
          gap: 18,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Registrar venta</h1>
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
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
          }}
        >
          <div
            style={{
              border: '1px solid #262626',
              borderRadius: 16,
              padding: 18,
              background: '#111',
            }}
          >
            <div style={{ color: '#aaa', fontSize: 14, marginBottom: 8 }}>
              Total vendido hoy
            </div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>${totalHoy}</div>
          </div>

          <div
            style={{
              border: '1px solid #262626',
              borderRadius: 16,
              padding: 18,
              background: '#111',
            }}
          >
            <div style={{ color: '#aaa', fontSize: 14, marginBottom: 8 }}>
              Total histórico vendido
            </div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>
              ${totalHistorico}
            </div>
          </div>
        </div>

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
              placeholder="Ej. Good Girl, 30ml..."
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
                      {p.presentacion} · Disponible: {p.stock_actual} · Precio: $
                      {p.precio ?? 0}
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
                    Presentación: {productoSeleccionado.presentacion}
                  </div>
                  <div style={{ color: '#ccc', marginBottom: 4 }}>
                    Precio: ${productoSeleccionado.precio ?? 0}
                  </div>
                  <div style={{ color: '#ccc' }}>
                    Disponible: {productoSeleccionado.stock_actual}
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
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
                Cantidad
              </label>
              <input
                type="number"
                min={1}
                placeholder="Cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
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
                Total de esta venta
              </label>
              <div
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid #333',
                  background: '#0c0c0c',
                  color: 'white',
                }}
              >
                $
                {productoSeleccionado
                  ? Number(productoSeleccionado.precio || 0) * cantidad
                  : 0}
              </div>
            </div>
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
              Nombre del cliente
            </label>
            <input
              placeholder="Nombre del cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
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
              Teléfono del cliente
            </label>
            <input
              placeholder="Teléfono del cliente"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginTop: 6,
            }}
          >
            <button
              onClick={registrarVenta}
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
              Confirmar Venta
            </button>

            <button
              onClick={cerrarSesion}
              style={{
                padding: 14,
                background: '#1a1a1a',
                color: 'white',
                border: '1px solid #333',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

