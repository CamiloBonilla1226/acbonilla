const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Lista del catálogo plano de adiciones del negocio. Se reutiliza en dos contextos:
// interactivo (domicilios, dentro de OpcionesProducto: checkboxes que arman el pedido) y
// `soloLectura` (carta física: nombre + precio, sin checkbox ni ninguna interacción de
// carrito, porque esa carta es solo para hojear el menú en el local). En modo soloLectura,
// `.lista-menu` es una grilla de 2 columnas (ver index.css) para que el precio de todas las
// filas empiece exactamente en el mismo punto, sin importar cuánto varíe el nombre.
export function ListaAdiciones({ adiciones, seleccionadas = [], onAlternar, soloLectura = false, titulo = 'Adiciones' }) {
  if (adiciones.length === 0) return null

  return (
    <fieldset className="grupo-opciones">
      <legend className="grupo-opciones__titulo">
        {titulo}
        {!soloLectura && <span className="grupo-opciones__obligatorio"> · opcional</span>}
      </legend>

      {soloLectura ? (
        <div className="lista-menu">
          {adiciones.map((adicion) => (
            <div key={adicion.id} className="fila-menu">
              <span className="fila-menu__etiqueta">
                <span className="fila-menu__nombre">{adicion.nombre}</span>
                <span className="fila-menu__leader" aria-hidden="true" />
              </span>
              <span className="fila-menu__precio texto-suave">
                {adicion.precio > 0 ? `+${formatoPrecio.format(adicion.precio)}` : ''}
              </span>
            </div>
          ))}
        </div>
      ) : (
        adiciones.map((adicion) => {
          const marcada = seleccionadas.some((a) => a.id === adicion.id)
          return (
            <label key={adicion.id} className="opcion-item">
              <input type="checkbox" checked={marcada} onChange={() => onAlternar(adicion)} />
              <span>{adicion.nombre}</span>
              {adicion.precio > 0 && <span className="texto-suave">+{formatoPrecio.format(adicion.precio)}</span>}
            </label>
          )
        })
      )}
    </fieldset>
  )
}
