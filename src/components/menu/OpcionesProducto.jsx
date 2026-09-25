import { useMemo, useState } from 'react'
import { ImagenProducto } from './ImagenProducto'
import { PrecioProducto } from '../promociones/BadgeOferta'
import { useSwipeParaCerrar } from '../../hooks/useSwipeParaCerrar'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function precioEfectivo(producto) {
  return producto.precio_oferta ?? producto.precio
}

// Panel de detalle de un producto con adiciones: catálogo plano del negocio completo
// (ver useAdiciones.js), no de un producto puntual — cualquier producto puede recibir
// cualquier adición, y todas son siempre opcionales (no hay grupos ni obligatoriedad).
export function OpcionesProducto({ producto, adiciones = [], onConfirmar, onCancelar }) {
  const [seleccionadas, setSeleccionadas] = useState([])
  const [cantidad, setCantidad] = useState(1)
  const swipe = useSwipeParaCerrar(onCancelar)

  const alternarAdicion = (adicion) => {
    setSeleccionadas((actuales) => {
      const yaElegida = actuales.some((a) => a.id === adicion.id)
      return yaElegida ? actuales.filter((a) => a.id !== adicion.id) : [...actuales, adicion]
    })
  }

  // Se traduce `precio` (campo de la tabla `adiciones`) a `precio_extra`, que es el nombre
  // que ya esperan useCarrito.js/whatsapp.js/Checkout.jsx desde que existían las opciones
  // agrupadas — evita tocar esos archivos por un simple cambio de nombre de columna.
  const opcionesElegidas = useMemo(
    () => seleccionadas.map((adicion) => ({ id: adicion.id, nombre: adicion.nombre, precio_extra: adicion.precio })),
    [seleccionadas]
  )

  const subtotal = useMemo(() => {
    const extras = opcionesElegidas.reduce((suma, o) => suma + (o.precio_extra ?? 0), 0)
    return (precioEfectivo(producto) + extras) * cantidad
  }, [producto, opcionesElegidas, cantidad])

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

        {adiciones.length > 0 && (
          <fieldset className="grupo-opciones">
            <legend className="grupo-opciones__titulo">
              Adiciones <span className="grupo-opciones__obligatorio"> · opcional</span>
            </legend>

            {adiciones.map((adicion) => {
              const marcada = seleccionadas.some((a) => a.id === adicion.id)
              return (
                <label key={adicion.id} className="opcion-item">
                  <input type="checkbox" checked={marcada} onChange={() => alternarAdicion(adicion)} />
                  <span>{adicion.nombre}</span>
                  {adicion.precio > 0 && (
                    <span className="texto-suave">+{formatoPrecio.format(adicion.precio)}</span>
                  )}
                </label>
              )
            })}
          </fieldset>
        )}

        <div className="opciones-producto__cantidad">
          <span>Cantidad</span>
          <div className="selector-cantidad">
            <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>
              −
            </button>
            <span>{cantidad}</span>
            <button type="button" onClick={() => setCantidad((c) => c + 1)}>
              +
            </button>
          </div>
        </div>

        <div className="opciones-producto__acciones">
          <button type="button" className="boton boton--secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className="boton" onClick={() => onConfirmar(cantidad, opcionesElegidas)}>
            Agregar · {formatoPrecio.format(subtotal)}
          </button>
        </div>
      </div>
    </div>
  )
}
