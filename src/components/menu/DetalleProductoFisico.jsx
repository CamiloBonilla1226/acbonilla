import { ImagenProducto } from './ImagenProducto'
import { ListaAdiciones } from './ListaAdiciones'
import { PrecioProducto } from '../promociones/BadgeOferta'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'

// Vista de detalle de un producto en la carta física: solo lectura, sin cantidad ni
// botón de agregar (esa carta no tiene carrito). Muestra las adiciones visibles en esta
// carta con ListaAdiciones en modo soloLectura — mismo componente que usa OpcionesProducto
// para domicilios, sin duplicar el listado.
export function DetalleProductoFisico({ producto, adiciones, onCerrar }) {
  const swipe = useSwipeParaCerrar(onCerrar)

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
        <PrecioProducto precio={producto.precio} precioOferta={producto.precio_oferta} />

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
