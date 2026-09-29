import { Interruptor } from './Interruptor'

export function TablaCategorias({ categorias, onEditar, onEliminar, onToggleActivo }) {
  if (categorias.length === 0) {
    return <p className="texto-suave">Todavía no hay categorías. Crea la primera.</p>
  }

  return (
    <ul className="lista-categorias-admin">
      {categorias.map((categoria) => (
        <li
          key={categoria.id}
          className="tarjeta categoria-admin-item categoria-admin-item--clicable"
          onClick={() => onEditar(categoria)}
        >
          <span>{categoria.nombre}</span>
          <div className="categoria-admin-item__acciones" onClick={(evento) => evento.stopPropagation()}>
            <Interruptor
              activo={categoria.activo}
              etiqueta=""
              onCambiar={(valor) => onToggleActivo(categoria.id, valor)}
            />
            <button type="button" className="carrito__quitar" onClick={() => onEliminar(categoria.id)}>
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
