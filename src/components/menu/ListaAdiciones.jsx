const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Lista del catálogo plano de adiciones del negocio. Se reutiliza en dos contextos:
// interactivo (domicilios, dentro de OpcionesProducto: checkboxes que arman el pedido) y
// `soloLectura` (carta física: nombre + precio, sin checkbox ni ninguna interacción de
// carrito, porque esa carta es solo para hojear el menú en el local).
export function ListaAdiciones({ adiciones, seleccionadas = [], onAlternar, soloLectura = false, titulo = 'Adiciones' }) {
  if (adiciones.length === 0) return null

  return (
    <fieldset className="grupo-opciones">
      <legend className="grupo-opciones__titulo">
        {titulo}
        {!soloLectura && <span className="grupo-opciones__obligatorio"> · opcional</span>}
      </legend>

      {adiciones.map((adicion) => {
        if (soloLectura) {
          return (
            <div key={adicion.id} className="opcion-item opcion-item--solo-lectura">
              <span>{adicion.nombre}</span>
              {adicion.precio > 0 && <span className="texto-suave">+{formatoPrecio.format(adicion.precio)}</span>}
            </div>
          )
        }

        const marcada = seleccionadas.some((a) => a.id === adicion.id)
        return (
          <label key={adicion.id} className="opcion-item">
            <input type="checkbox" checked={marcada} onChange={() => onAlternar(adicion)} />
            <span>{adicion.nombre}</span>
            {adicion.precio > 0 && <span className="texto-suave">+{formatoPrecio.format(adicion.precio)}</span>}
          </label>
        )
      })}
    </fieldset>
  )
}
