// Chips de categorías en Inicio: tocar una lleva a la pestaña Menú con esa categoría ya
// seleccionada (ver Carta.jsx: irACategoria).
export function SeccionCategorias({ categorias, onSeleccionar }) {
  if (categorias.length === 0) return null

  return (
    <section className="seccion-categorias">
      <h2>Categorías</h2>
      <div className="seccion-categorias__grid">
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            type="button"
            className="chip-categoria"
            onClick={() => onSeleccionar(categoria.id)}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>
    </section>
  )
}
