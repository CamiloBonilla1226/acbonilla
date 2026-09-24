import { AdminNav } from '../../components/admin/AdminNav'
import { TablaPedidos } from '../../components/admin/TablaPedidos'
import { usePedidos } from '../../hooks/usePedidos'

export function Pedidos() {
  const { pedidos, cargando, error, actualizarEstadoPedido } = usePedidos({ tiempoReal: true })

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-pedidos">
        <h1>Pedidos</h1>
        {cargando && <p className="texto-suave">Cargando pedidos…</p>}
        {error && <p className="campo__error">No se pudieron cargar los pedidos.</p>}
        {!cargando && !error && <TablaPedidos pedidos={pedidos} onActualizarEstado={actualizarEstadoPedido} />}
      </main>
    </>
  )
}
