import { Interruptor } from './Interruptor'
import { ImagenProducto } from '../menu/ImagenProducto'
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
          <li
            key={producto.id}
            className="tarjeta producto-admin-item producto-admin-item--clicable"
            onClick={() => onEditar(producto)}
          >
            <div className="producto-admin-item__imagen">
              <ImagenProducto src={producto.imagen_url} alt={producto.nombre} />
            </div>
            <div className="producto-admin-item__info">
              <strong className="producto-admin-item__nombre" title={producto.nombre}>
                {producto.nombre}
              </strong>
              <span className="texto-suave producto-admin-item__categoria">
                {producto.categoria?.nombre ?? 'Sin categoría'}
              </span>
              <span className="producto-admin-item__precio">
                {variantes.length > 0
                  ? `Desde ${formatoPrecio.format(precioMinimo(variantes))}`
                  : formatoPrecio.format(producto.precio_oferta ?? producto.precio)}
              </span>
              <span className="producto-admin-item__etiquetas">
                {producto.destacado && <span className="producto-admin-item__etiqueta">★ Destacado</span>}
                {!producto.disponible && (
                  <span className="producto-admin-item__etiqueta producto-admin-item__etiqueta--agotado">
                    Agotado
                  </span>
                )}
              </span>
            </div>
            <div className="producto-admin-item__acciones" onClick={(evento) => evento.stopPropagation()}>
              <Interruptor
                activo={producto.disponible}
                onCambiar={(valor) => onToggleDisponible(producto.id, valor)}
              />
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
