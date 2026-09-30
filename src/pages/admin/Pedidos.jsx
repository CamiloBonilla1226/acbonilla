import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import {
  FiltrosPedidos,
  aplicarFiltrosPedidos,
  filtrosPedidosIniciales,
} from '../../components/admin/FiltrosPedidos'
import { TablaPedidos } from '../../components/admin/TablaPedidos'
import { usePedidos } from '../../hooks/usePedidos'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export function Pedidos() {
  const { pedidos, cargando, error, actualizarEstadoPedido } = usePedidos({ tiempoReal: true })
  const { nombre } = useAuth()
  const mostrarToast = useToast()
  const [filtros, setFiltros] = useState(filtrosPedidosIniciales)
  const pedidosFiltrados = aplicarFiltrosPedidos(pedidos, filtros)

  const cambiarEstado = async (id, estado) => {
    const { exito } = await actualizarEstadoPedido(id, estado, nombre)
    mostrarToast(exito ? 'Estado del pedido actualizado' : 'No se pudo actualizar el estado', exito ? 'exito' : 'error')
  }

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-pedidos">
        <h1>Pedidos</h1>
        {cargando && <p className="texto-suave">Cargando pedidos…</p>}
        {error && <p className="campo__error">No se pudieron cargar los pedidos.</p>}
        {!cargando && !error && (
          <>
            <FiltrosPedidos
              filtros={filtros}
              onCambiar={setFiltros}
              total={pedidos.length}
              mostrados={pedidosFiltrados.length}
            />
            <TablaPedidos pedidos={pedidosFiltrados} onActualizarEstado={cambiarEstado} />
          </>
        )}
      </main>
    </>
  )
}
