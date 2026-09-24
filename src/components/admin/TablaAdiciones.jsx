import { Interruptor } from './Interruptor'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function TablaAdiciones({ adiciones, onEditar, onEliminar, onToggleDisponible }) {
  if (adiciones.length === 0) {
    return <p className="texto-suave">Todavía no hay adiciones. Crea la primera.</p>
  }

  return (
    <ul className="lista-productos-admin">
      {adiciones.map((adicion) => (
        <li key={adicion.id} className="tarjeta producto-admin-item">
          <div className="producto-admin-item__info">
            <strong>{adicion.nombre}</strong>
            {adicion.descripcion && <span className="texto-suave">{adicion.descripcion}</span>}
            <span>
              {formatoPrecio.format(adicion.precio)}
              {!adicion.disponible && ' · No disponible'}
            </span>
          </div>
          <div className="producto-admin-item__acciones">
            <Interruptor
              activo={adicion.disponible}
              onCambiar={(valor) => onToggleDisponible(adicion.id, valor)}
            />
            <button type="button" className="boton boton--secundario boton--pequeno" onClick={() => onEditar(adicion)}>
              Editar
            </button>
            <button type="button" className="carrito__quitar" onClick={() => onEliminar(adicion.id)}>
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
