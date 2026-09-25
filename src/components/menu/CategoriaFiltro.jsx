// `tabsExtra` permite agregar pestañas que no son categorías reales (ej. "Adiciones" en
// la carta física, ver CartaFisica.jsx), identificadas por un id propio en vez de un
// categoria.id.
export function CategoriaFiltro({ categorias, categoriaActivaId, onSeleccionar, tabsExtra = [] }) {
  return (
    <nav className="filtro-categorias" aria-label="Filtrar por categoría">
      <button
        type="button"
        className={`filtro-categorias__item ${categoriaActivaId === null ? 'filtro-categorias__item--activo' : ''}`}
        onClick={() => onSeleccionar(null)}
      >
        Todas
      </button>
      {categorias.map((categoria) => (
        <button
          key={categoria.id}
          type="button"
          className={`filtro-categorias__item ${
            categoriaActivaId === categoria.id ? 'filtro-categorias__item--activo' : ''
          }`}
          onClick={() => onSeleccionar(categoria.id)}
        >
          {categoria.nombre}
        </button>
      ))}
      {tabsExtra.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`filtro-categorias__item ${
            categoriaActivaId === tab.id ? 'filtro-categorias__item--activo' : ''
          }`}
          onClick={() => onSeleccionar(tab.id)}
        >
          {tab.etiqueta}
        </button>
      ))}
    </nav>
  )
}
