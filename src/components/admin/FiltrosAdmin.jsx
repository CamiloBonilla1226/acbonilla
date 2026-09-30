// Barra de filtros de las listas admin: cada grupo es una fila con su título y "chips"
// (botones tipo píldora, uno seleccionado a la vez). En móvil cada fila se desliza en
// horizontal si no cabe, en vez de partirse en varias líneas.
export function GrupoFiltro({ titulo, opciones, valor, onCambiar }) {
  return (
    <div className="filtros-admin__grupo" role="group" aria-label={titulo}>
      <span className="filtros-admin__titulo">{titulo}</span>
      <div className="filtros-admin__chips">
        {opciones.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            className={`filtros-admin__chip${valor === opcion.valor ? ' filtros-admin__chip--activo' : ''}`}
            aria-pressed={valor === opcion.valor}
            onClick={() => onCambiar(opcion.valor)}
          >
            {opcion.texto}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FiltrosAdmin({ children, total, mostrados, hayFiltros, onLimpiar }) {
  return (
    <section className="filtros-admin" aria-label="Filtros">
      {children}
      <div className="filtros-admin__pie">
        <span className="texto-suave">
          {mostrados === total ? `${total} en total` : `Mostrando ${mostrados} de ${total}`}
        </span>
        {hayFiltros && (
          <button type="button" className="filtros-admin__limpiar" onClick={onLimpiar}>
            Limpiar filtros
          </button>
        )}
      </div>
    </section>
  )
}
