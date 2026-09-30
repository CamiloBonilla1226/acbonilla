import { AdminNav } from '../../components/admin/AdminNav'
import { useAuth } from '../../hooks/useAuth'
import { usePedidos } from '../../hooks/usePedidos'
import { useProductos } from '../../hooks/useProductos'
import { useCategorias } from '../../hooks/useCategorias'
import { useAdiciones } from '../../hooks/useAdiciones'
import { useUsuariosAdmin } from '../../hooks/useUsuariosAdmin'
import { negocioConfig } from '../../config/negocio.config'

function Metrica({ titulo, valor, detalle, cargando }) {
  return (
    <div className="tarjeta admin-dashboard__metrica">
      <span className="texto-suave">{titulo}</span>
      <strong>{cargando ? '—' : valor}</strong>
      {detalle && <span className="admin-dashboard__detalle">{cargando ? ' ' : detalle}</span>}
    </div>
  )
}

export function Dashboard() {
  const { esDueno } = useAuth()
  const { pedidos, cargando: cargandoPedidos } = usePedidos()
  const { productos, cargando: cargandoProductos } = useProductos()
  const { categorias, cargando: cargandoCategorias } = useCategorias()
  const { adiciones, cargando: cargandoAdiciones } = useAdiciones()
  const { usuarios, cargando: cargandoUsuarios } = useUsuariosAdmin()

  const pedidosNuevos = pedidos.filter((p) => p.estado === 'nuevo').length
  const productosActivos = productos.filter((p) => p.disponible).length
  const categoriasActivas = categorias.filter((c) => c.activo).length
  const adicionesDisponibles = adiciones.filter((a) => a.disponible).length
  const dueno = usuarios.find((u) => u.rol === 'dueño')
  const empleados = usuarios.filter((u) => u.rol !== 'dueño')

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-dashboard">
        <section className="tarjeta admin-dashboard__negocio">
          <span className="admin-dashboard__etiqueta">Negocio</span>
          <h1>{negocioConfig.nombre}</h1>
          <div className="admin-dashboard__dueno">
            <span className="texto-suave">Dueño</span>
            <strong>{cargandoUsuarios ? '—' : (dueno?.nombre ?? 'Sin registrar')}</strong>
          </div>
        </section>

        <div className="admin-dashboard__metricas">
          <Metrica
            titulo="Pedidos"
            valor={pedidos.length}
            detalle={`${pedidosNuevos} nuevos`}
            cargando={cargandoPedidos}
          />
          <Metrica
            titulo="Productos"
            valor={productos.length}
            detalle={`${productosActivos} activos`}
            cargando={cargandoProductos}
          />
          <Metrica
            titulo="Categorías"
            valor={categorias.length}
            detalle={`${categoriasActivas} activas`}
            cargando={cargandoCategorias}
          />
          <Metrica
            titulo="Adiciones"
            valor={adiciones.length}
            detalle={`${adicionesDisponibles} disponibles`}
            cargando={cargandoAdiciones}
          />
          {esDueno && <Metrica titulo="Empleados" valor={empleados.length} cargando={cargandoUsuarios} />}
        </div>
      </main>
    </>
  )
}
