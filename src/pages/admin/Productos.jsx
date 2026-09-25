import { useState } from 'react'
import { AdminNav } from '../../components/admin/AdminNav'
import { TablaProductos } from '../../components/admin/TablaProductos'
import { FormularioProducto } from '../../components/admin/FormularioProducto'
import { useCategorias } from '../../hooks/useCategorias'
import { useProductos } from '../../hooks/useProductos'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'
import { alSoltarFondo } from '../../lib/superposicion'

export function Productos() {
  const { categorias } = useCategorias()
  const { productos, cargando, error, crearProducto, actualizarProducto, eliminarProducto, toggleDisponible } =
    useProductos()

  const [productoEnEdicion, setProductoEnEdicion] = useState(null) // objeto o 'nuevo'
  const cerrarModal = () => setProductoEnEdicion(null)
  const swipe = useSwipeParaCerrar(cerrarModal)

  const guardarProducto = async (datos) => {
    const resultado =
      productoEnEdicion === 'nuevo'
        ? await crearProducto(datos)
        : await actualizarProducto(productoEnEdicion.id, datos)

    if (resultado.exito) setProductoEnEdicion(null)
    return resultado
  }

  const confirmarEliminar = async (id) => {
    if (window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
      await eliminarProducto(id)
    }
  }

  return (
    <>
      <AdminNav />
      <main className="contenedor admin-productos">
        <h1>Productos</h1>

        <button type="button" className="admin-crear admin-crear--boton" onClick={() => setProductoEnEdicion('nuevo')}>
          <span className="admin-crear__icono" aria-hidden="true">
            +
          </span>
          Nuevo producto
        </button>

        {cargando && <p className="texto-suave">Cargando productos…</p>}
        {error && <p className="campo__error">No se pudieron cargar los productos.</p>}
        {!cargando && !error && (
          <TablaProductos
            productos={productos}
            onEditar={setProductoEnEdicion}
            onEliminar={confirmarEliminar}
            onToggleDisponible={toggleDisponible}
          />
        )}
      </main>

      {productoEnEdicion && (
        <div className="superposicion" role="dialog" aria-modal="true" onClick={alSoltarFondo(cerrarModal)}>
          <div
            className="superposicion__panel"
            style={swipe.estilo}
            onTouchStart={swipe.onTouchStart}
            onTouchMove={swipe.onTouchMove}
            onTouchEnd={swipe.onTouchEnd}
          >
            <button type="button" className="superposicion__cerrar-x" onClick={cerrarModal} aria-label="Cerrar">
              ×
            </button>
            <h2>{productoEnEdicion === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}</h2>
            <FormularioProducto
              categorias={categorias}
              productoInicial={productoEnEdicion === 'nuevo' ? null : productoEnEdicion}
              onGuardar={guardarProducto}
              onCancelar={() => setProductoEnEdicion(null)}
            />
          </div>
        </div>
      )}
    </>
  )
}
