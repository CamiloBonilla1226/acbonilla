import { ImagenProducto } from './ImagenProducto'
import { ListaAdiciones } from './ListaAdiciones'
import { PrecioProducto } from '../promociones/BadgeOferta'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'
import { useVariantesProducto } from '../../hooks/useVariantesProducto'
import { precioMinimo } from '../../lib/variantes'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Vista de detalle de un producto en la carta física: solo lectura, sin cantidad ni
// botón de agregar (esa carta no tiene carrito). Muestra las adiciones y las variantes
// (tamaños, sabores) visibles en esta carta con ListaAdiciones en modo soloLectura — mismo
// componente que usa OpcionesProducto para domicilios, sin duplicar el listado. Las
// variantes son solo informativas aquí, sin selector: no hay carrito que arme un pedido.
export function DetalleProductoFisico({ producto, adiciones, onCerrar }) {
  const swipe = useSwipeParaCerrar(onCerrar)
  const { variantes } = useVariantesProducto(producto.id, { soloDisponibles: true })

  return (
    <div
      className="opciones-producto"
      style={swipe.estilo}
      onTouchStart={swipe.onTouchStart}
      onTouchMove={swipe.onTouchMove}
      onTouchEnd={swipe.onTouchEnd}
    >
      <ImagenProducto src={producto.imagen_url} alt={producto.nombre} relacionAspecto="4 / 3" prioridad />

      <div className="opciones-producto__contenido">
        <h2 className="opciones-producto__nombre">{producto.nombre}</h2>
        {producto.descripcion && <p className="texto-suave">{producto.descripcion}</p>}

        {variantes.length > 0 ? (
          <span className="precio-producto">Desde {formatoPrecio.format(precioMinimo(variantes))}</span>
        ) : (
          <PrecioProducto precio={producto.precio} precioOferta={producto.precio_oferta} />
        )}

        <ListaAdiciones adiciones={variantes} soloLectura titulo="Variantes" />
        <ListaAdiciones adiciones={adiciones} soloLectura titulo="Adiciones disponibles" />

        <div className="opciones-producto__acciones">
          <button type="button" className="boton" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
