import { PrecioProducto } from '../promociones/BadgeOferta'

// Listado de productos de la carta física: mismo estilo de fila que ListaAdiciones
// (nombre a la izquierda, precio a la derecha, sin imagen), pero cada fila es un botón
// que abre el detalle del producto (DetalleProductoFisico) en vez de ser solo lectura.
export function ListaProductosFisica({ productos, onSeleccionar }) {
  if (productos.length === 0) return null

  return (
    <ul className="lista-productos-fisica">
      {productos.map((producto) => {
        const agotado = !producto.disponible
        return (
          <li key={producto.id}>
            <button
              type="button"
              className="opcion-item opcion-item--solo-lectura opcion-item--clickeable"
              onClick={() => onSeleccionar(producto)}
            >
              <span>
                {producto.nombre}
                {agotado && <span className="producto-card__agotado"> · Agotado</span>}
              </span>
              <PrecioProducto precio={producto.precio} precioOferta={producto.precio_oferta} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
