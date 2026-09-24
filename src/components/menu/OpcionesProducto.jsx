import { useMemo, useState } from 'react'
import { ImagenProducto } from './ImagenProducto'
import { PrecioProducto } from '../promociones/BadgeOferta'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function precioEfectivo(producto) {
  return producto.precio_oferta ?? producto.precio
}

// Panel de detalle de un producto con adiciones/variantes: deja elegir opciones de
// cada grupo (única o múltiple selección, según `grupos_opciones.seleccion`) antes de
// agregarlo al carrito, como pide el flujo de "Detalle de producto" del contexto.
// `grupos` ya no viene anidado en `producto`: las adiciones son del negocio completo
// (ver useAdiciones.js), no de un producto puntual, así que se reciben aparte y son
// las mismas para cualquier producto que se seleccione.
export function OpcionesProducto({ producto, grupos = [], onConfirmar, onCancelar }) {
  const [seleccion, setSeleccion] = useState({})
  const [cantidad, setCantidad] = useState(1)

  const toggleOpcionUnica = (grupoId, opcion) => {
    setSeleccion((actual) => ({ ...actual, [grupoId]: [opcion] }))
  }

  const toggleOpcionMultiple = (grupoId, opcion) => {
    setSeleccion((actual) => {
      const actuales = actual[grupoId] ?? []
      const yaElegida = actuales.some((o) => o.id === opcion.id)
      const nuevas = yaElegida ? actuales.filter((o) => o.id !== opcion.id) : [...actuales, opcion]
      return { ...actual, [grupoId]: nuevas }
    })
  }

  const gruposIncompletos = useMemo(
    () => grupos.filter((grupo) => grupo.obligatorio && !(seleccion[grupo.id]?.length > 0)),
    [grupos, seleccion]
  )

  const opcionesElegidas = useMemo(() => Object.values(seleccion).flat(), [seleccion])

  const subtotal = useMemo(() => {
    const extras = opcionesElegidas.reduce((suma, o) => suma + (o.precio_extra ?? 0), 0)
    return (precioEfectivo(producto) + extras) * cantidad
  }, [producto, opcionesElegidas, cantidad])

  const puedeConfirmar = gruposIncompletos.length === 0

  return (
    <div className="opciones-producto">
      <ImagenProducto src={producto.imagen_url} alt={producto.nombre} relacionAspecto="16 / 9" prioridad />

      <div className="opciones-producto__contenido">
        <h2 className="opciones-producto__nombre">{producto.nombre}</h2>
        {producto.descripcion && <p className="texto-suave">{producto.descripcion}</p>}
        <PrecioProducto precio={producto.precio} precioOferta={producto.precio_oferta} />

        {grupos.map((grupo) => (
          <fieldset key={grupo.id} className="grupo-opciones">
            <legend className="grupo-opciones__titulo">
              {grupo.nombre}
              {grupo.obligatorio && <span className="grupo-opciones__obligatorio"> · obligatorio</span>}
            </legend>

            {(grupo.opciones ?? []).map((opcion) => {
              const marcada = (seleccion[grupo.id] ?? []).some((o) => o.id === opcion.id)
              return (
                <label key={opcion.id} className="opcion-item">
                  <input
                    type={grupo.seleccion === 'unica' ? 'radio' : 'checkbox'}
                    name={`grupo-${grupo.id}`}
                    checked={marcada}
                    onChange={() =>
                      grupo.seleccion === 'unica'
                        ? toggleOpcionUnica(grupo.id, opcion)
                        : toggleOpcionMultiple(grupo.id, opcion)
                    }
                  />
                  <span>{opcion.nombre}</span>
                  {opcion.precio_extra > 0 && (
                    <span className="texto-suave">+{formatoPrecio.format(opcion.precio_extra)}</span>
                  )}
                </label>
              )
            })}
          </fieldset>
        ))}

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
            disabled={!puedeConfirmar}
            onClick={() => onConfirmar(cantidad, opcionesElegidas)}
          >
            Agregar · {formatoPrecio.format(subtotal)}
          </button>
        </div>
      </div>
    </div>
  )
}
