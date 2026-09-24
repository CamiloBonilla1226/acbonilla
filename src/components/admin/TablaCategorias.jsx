export function TablaCategorias({ categorias, onEditar, onEliminar }) {
  if (categorias.length === 0) {
    return <p className="texto-suave">Todavía no hay categorías. Crea la primera.</p>
  }

  return (
    <ul className="lista-categorias-admin">
      {categorias.map((categoria) => (
        <li key={categoria.id} className="tarjeta categoria-admin-item">
          <span>{categoria.nombre}</span>
          <div className="categoria-admin-item__acciones">
            <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => onEditar(categoria)}>
              Editar
            </button>
            <button type="button" className="carrito__quitar" onClick={() => onEliminar(categoria.id)}>
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
