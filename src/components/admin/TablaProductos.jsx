import { Interruptor } from './Interruptor'
import { precioMinimo, variantesDisponibles } from '../../lib/variantes'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function TablaProductos({ productos, onEditar, onEliminar, onToggleDisponible }) {
  if (productos.length === 0) {
    return <p className="texto-suave">Todavía no hay productos. Crea el primero.</p>
  }

  return (
    <ul className="lista-productos-admin">
      {productos.map((producto) => {
        const variantes = variantesDisponibles(producto)
        return (
          <li key={producto.id} className="tarjeta producto-admin-item">
            <div className="producto-admin-item__info">
              <strong>{producto.nombre}</strong>
              <span className="texto-suave">{producto.categoria?.nombre ?? 'Sin categoría'}</span>
              <span>
                {variantes.length > 0
                  ? `Desde ${formatoPrecio.format(precioMinimo(variantes))}`
                  : formatoPrecio.format(producto.precio_oferta ?? producto.precio)}
                {!producto.disponible && ' · Agotado'}
              </span>
            </div>
            <div className="producto-admin-item__acciones">
              <Interruptor
                activo={producto.disponible}
                onCambiar={(valor) => onToggleDisponible(producto.id, valor)}
              />
              <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => onEditar(producto)}>
                Editar
              </button>
              <button type="button" className="carrito__quitar" onClick={() => onEliminar(producto.id)}>
                Eliminar
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
