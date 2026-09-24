export function CategoriaFiltro({ categorias, categoriaActivaId, onSeleccionar }) {
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
    </nav>
  )
}
