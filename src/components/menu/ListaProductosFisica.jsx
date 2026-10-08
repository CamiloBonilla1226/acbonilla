import { ImagenProducto } from './ImagenProducto'
import { PrecioProducto } from '../promociones/BadgeOferta'
import { precioMinimo, variantesDisponibles } from '../../lib/variantes'
import { preciosCartaFisica, varianteCartaFisica } from '../../lib/preciosCartaFisica'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Productos de la carta física: fila con foto cuadrada, nombre, descripción corta (máximo
// dos líneas) y precio. Toda la fila abre el detalle. Los precios son los de la carta física
// (pueden ser distintos a domicilios, ver lib/preciosCartaFisica.js).
export function ListaProductosFisica({ productos, onSeleccionar }) {
  if (productos.length === 0) return null

  return (
    <ul className="productos-fisica">
      {productos.map((producto) => {
        const variantes = variantesDisponibles(producto).map(varianteCartaFisica)
        const { precio, precioOferta } = preciosCartaFisica(producto)
        return (
          <li key={producto.id}>
            <button type="button" className="producto-fisica" onClick={() => onSeleccionar(producto)}>
              <span className="producto-fisica__imagen">
                <ImagenProducto src={producto.imagen_url} alt="" relacionAspecto="1 / 1" />
              </span>
              <span className="producto-fisica__info">
                <span className="producto-fisica__nombre">{producto.nombre}</span>
                {producto.descripcion && <span className="producto-fisica__descripcion">{producto.descripcion}</span>}
                <span className="producto-fisica__precio">
                  {variantes.length > 0 ? (
                    <span className="precio-producto">Desde {formatoPrecio.format(precioMinimo(variantes))}</span>
                  ) : (
                    <PrecioProducto precio={precio} precioOferta={precioOferta} />
                  )}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
