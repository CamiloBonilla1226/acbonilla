import { Interruptor } from './Interruptor'
import { ImagenProducto } from '../menu/ImagenProducto'
import { precioMinimo, variantesDisponibles } from '../../lib/variantes'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// `seleccionados` (Set de ids) + `onAlternarSeleccion`: casilla por producto para las
// acciones masivas de Productos.jsx. Mientras haya al menos uno seleccionado, tocar una
// tarjeta la marca o desmarca en vez de abrir el editor (como en las apps de correo).
export function TablaProductos({
  productos,
  seleccionados,
  onAlternarSeleccion,
  onEditar,
  onEliminar,
  onToggleDisponible,
}) {
  if (productos.length === 0) {
    return <p className="texto-suave">No hay productos para mostrar.</p>
  }

  const modoSeleccion = seleccionados.size > 0

  return (
    <ul className="lista-productos-admin">
      {productos.map((producto) => {
        const variantes = variantesDisponibles(producto)
        const seleccionado = seleccionados.has(producto.id)
        const nombresCategorias = producto.categorias.map((categoria) => categoria.nombre).join(' · ')
        return (
          <li
            key={producto.id}
            className={`tarjeta producto-admin-item producto-admin-item--clicable producto-admin-item--seleccionable${
              seleccionado ? ' producto-admin-item--seleccionado' : ''
            }`}
            onClick={() => (modoSeleccion ? onAlternarSeleccion(producto.id) : onEditar(producto))}
          >
            <label className="producto-admin-item__casilla" onClick={(evento) => evento.stopPropagation()}>
              <input
                type="checkbox"
                checked={seleccionado}
                onChange={() => onAlternarSeleccion(producto.id)}
                aria-label={`Seleccionar ${producto.nombre}`}
              />
            </label>
            <div className="producto-admin-item__imagen">
              <ImagenProducto src={producto.imagen_url} alt={producto.nombre} />
            </div>
            <div className="producto-admin-item__info">
              <strong className="producto-admin-item__nombre" title={producto.nombre}>
                {producto.nombre}
              </strong>
              <span className="texto-suave producto-admin-item__categoria" title={nombresCategorias}>
                {nombresCategorias || 'Sin categoría'}
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
