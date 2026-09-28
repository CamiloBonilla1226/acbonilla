import { AdminNav } from '../../components/admin/AdminNav'
import { useAuth } from '../../hooks/useAuth'
import { usePedidos } from '../../hooks/usePedidos'

export function Dashboard() {
  const { esDueno } = useAuth()
  const { pedidos, cargando } = usePedidos()
  const pedidosNuevos = pedidos.filter((p) => p.estado === 'nuevo').length

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-dashboard">
        <h1>Dashboard</h1>
        <p className="texto-suave">{esDueno ? 'Acceso completo (dueño).' : 'Acceso limitado a pedidos (empleado).'}</p>

        <div className="tarjeta admin-dashboard__resumen">
          <span className="texto-suave">Pedidos nuevos</span>
          <strong>{cargando ? '—' : pedidosNuevos}</strong>
        </div>
      </main>
    </>
  )
}
