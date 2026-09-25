import { useMemo, useState } from 'react'
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

// Cuando el producto tiene variantes (tamaños, sabores), su precio (y precio de oferta) ya
// no aplican: el precio real lo da la variante elegida. Ver GestionVariantes.jsx / brief.
function precioEfectivo(producto, variante) {
  if (variante) return variante.precio
  return producto.precio_oferta ?? producto.precio
}

// Panel de detalle de un producto con adiciones: catálogo plano del negocio completo
// (ver useAdiciones.js), no de un producto puntual — cualquier producto puede recibir
// cualquier adición, y todas son siempre opcionales (no hay grupos ni obligatoriedad).
// Las variantes, en cambio, son propias de este producto (`useVariantesProducto`) y la
// elección es obligatoria: cambian el precio final en vez de sumarse.
export function OpcionesProducto({ producto, adiciones = [], onConfirmar, onCancelar }) {
  const { variantes } = useVariantesProducto(producto.id, { soloDisponibles: true })
  const [seleccionadas, setSeleccionadas] = useState([])
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const swipe = useSwipeParaCerrar(onCancelar)

  const tieneVariantes = variantes.length > 0
  const faltaElegirVariante = tieneVariantes && !varianteSeleccionada

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
    return (precioEfectivo(producto, varianteSeleccionada) + extras) * cantidad
  }, [producto, varianteSeleccionada, opcionesElegidas, cantidad])

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

        {tieneVariantes ? (
          varianteSeleccionada ? (
            <PrecioProducto precio={varianteSeleccionada.precio} />
          ) : (
            <span className="precio-producto">Desde {formatoPrecio.format(precioMinimo(variantes))}</span>
          )
        ) : (
          <PrecioProducto precio={producto.precio} precioOferta={producto.precio_oferta} />
        )}

        {tieneVariantes && (
          <fieldset className="grupo-opciones">
            <legend className="grupo-opciones__titulo">
              Elige una opción <span className="grupo-opciones__obligatorio"> · obligatorio</span>
            </legend>
            {variantes.map((variante) => (
              <label key={variante.id} className="opcion-item">
                <input
                  type="radio"
                  name="variante-producto"
                  checked={varianteSeleccionada?.id === variante.id}
                  onChange={() => setVarianteSeleccionada(variante)}
                />
                <span>{variante.nombre}</span>
                <span className="texto-suave">{formatoPrecio.format(variante.precio)}</span>
              </label>
            ))}
          </fieldset>
        )}

        <ListaAdiciones adiciones={adiciones} seleccionadas={seleccionadas} onAlternar={alternarAdicion} />

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
          <button
            type="button"
            className="boton"
            disabled={faltaElegirVariante}
            onClick={() => onConfirmar(cantidad, opcionesElegidas, varianteSeleccionada)}
          >
            {faltaElegirVariante ? 'Elige una opción' : `Agregar · ${formatoPrecio.format(subtotal)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
