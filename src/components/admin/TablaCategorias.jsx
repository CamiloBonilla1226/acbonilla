import { Interruptor } from './Interruptor'

export function TablaCategorias({ categorias, onEditar, onEliminar, onToggleActivo }) {
  if (categorias.length === 0) {
    return <p className="texto-suave">Todavía no hay categorías. Crea la primera.</p>
  }

  return (
    <ul className="lista-categorias-admin">
      {categorias.map((categoria) => (
        <li key={categoria.id} className="tarjeta categoria-admin-item">
          <span>
            {categoria.nombre}
            {!categoria.activo && ' · Desactivada'}
          </span>
          <div className="categoria-admin-item__acciones">
            <Interruptor
              activo={categoria.activo}
              etiqueta="Activa"
              onCambiar={(valor) => onToggleActivo(categoria.id, valor)}
            />
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
