import { PrecioProducto } from '../promociones/BadgeOferta'
import { precioMinimo, variantesDisponibles } from '../../lib/variantes'
import { preciosCartaFisica, varianteCartaFisica } from '../../lib/preciosCartaFisica'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Listado de productos de la carta física: patrón de menú impreso (nombre — línea
// punteada — precio). `.lista-menu` es una grilla de 2 columnas (ver index.css): la
// columna de precio se ajusta al precio más ancho de TODA la lista, así que todos los
// precios empiezan exactamente en el mismo punto sin importar cuánto varíe el nombre.
// Los precios son los de la carta física (pueden ser distintos a domicilios, ver
// lib/preciosCartaFisica.js).
export function ListaProductosFisica({ productos, onSeleccionar }) {
  if (productos.length === 0) return null

  return (
    <ul className="lista-menu">
      {productos.map((producto) => {
        const agotado = !producto.disponible
        const variantes = variantesDisponibles(producto).map(varianteCartaFisica)
        const { precio, precioOferta } = preciosCartaFisica(producto)
        return (
          <li
            key={producto.id}
            className="fila-menu"
            role="button"
            tabIndex={0}
            onClick={() => onSeleccionar(producto)}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault()
                onSeleccionar(producto)
              }
            }}
          >
            <span className="fila-menu__etiqueta">
              <span className="fila-menu__nombre">
                {producto.nombre}
                {agotado && <span className="producto-card__agotado"> · Agotado</span>}
              </span>
              <span className="fila-menu__leader" aria-hidden="true" />
            </span>
            <span className="fila-menu__precio">
              {variantes.length > 0 ? (
                `Desde ${formatoPrecio.format(precioMinimo(variantes))}`
              ) : (
                <PrecioProducto precio={precio} precioOferta={precioOferta} />
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
