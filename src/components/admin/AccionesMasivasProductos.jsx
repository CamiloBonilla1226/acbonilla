// Barra fija al pie de la lista mientras hay productos seleccionados en Productos.jsx.
export function AccionesMasivasProductos({
  cantidad,
  totalVisibles,
  ocupado,
  onSeleccionarTodos,
  onLimpiar,
  onActivar,
  onDesactivar,
  onCategorias,
  onEliminar,
}) {
  return (
    <div className="acciones-masivas" role="region" aria-label="Acciones para los productos seleccionados">
      <div className="acciones-masivas__encabezado">
        <strong>
          {cantidad} seleccionado{cantidad === 1 ? '' : 's'}
        </strong>
        {cantidad < totalVisibles && (
          <button type="button" className="acciones-masivas__enlace" onClick={onSeleccionarTodos} disabled={ocupado}>
            Seleccionar los {totalVisibles}
          </button>
        )}
        <button type="button" className="acciones-masivas__enlace" onClick={onLimpiar} disabled={ocupado}>
          Quitar selección
        </button>
      </div>
      <div className="acciones-masivas__botones">
        <button type="button" className="boton boton--secundario boton--pequeno" onClick={onActivar} disabled={ocupado}>
          Activar
        </button>
        <button type="button" className="boton boton--secundario boton--pequeno" onClick={onDesactivar} disabled={ocupado}>
          Desactivar
        </button>
        <button type="button" className="boton boton--secundario boton--pequeno" onClick={onCategorias} disabled={ocupado}>
          Categorías
        </button>
        <button type="button" className="boton boton--peligro boton--pequeno" onClick={onEliminar} disabled={ocupado}>
          Eliminar
        </button>
      </div>
    </div>
  )
}
