import { PrecioProducto } from '../promociones/BadgeOferta'
import { precioMinimo, variantesDisponibles } from '../../lib/variantes'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Listado de productos de la carta física: cada fila usa el patrón de menú impreso
// (nombre — línea punteada — precio, ver .fila-menu en index.css), clicable para abrir el
// detalle del producto (DetalleProductoFisico).
export function ListaProductosFisica({ productos, onSeleccionar }) {
  if (productos.length === 0) return null

  return (
    <ul className="lista-menu">
      {productos.map((producto) => {
        const agotado = !producto.disponible
        const variantes = variantesDisponibles(producto)
        return (
          <li key={producto.id}>
            <button type="button" className="fila-menu" onClick={() => onSeleccionar(producto)}>
              <span className="fila-menu__nombre">
                {producto.nombre}
                {agotado && <span className="producto-card__agotado"> · Agotado</span>}
              </span>
              <span className="fila-menu__leader" aria-hidden="true" />
              <span className="fila-menu__precio">
                {variantes.length > 0 ? (
                  `Desde ${formatoPrecio.format(precioMinimo(variantes))}`
                ) : (
                  <PrecioProducto precio={producto.precio} precioOferta={producto.precio_oferta} />
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
