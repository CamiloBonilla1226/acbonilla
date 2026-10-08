import { Interruptor } from './Interruptor'

// Lista de ofertas del panel: tocar la tarjeta abre el editor; el interruptor la activa o
// desactiva; "Mostrar en Inicio" elige cuál de las activas sale en la tarjeta de Inicio.
// `fija`: la oferta de domicilio gratis, que no se elimina (`detalle` explica qué hace).
export function TablaOfertas({ ofertas, fija = false, detalle, vacio, onEditar, onEliminar, onCambiarActiva, onPonerEnInicio }) {
  if (ofertas.length === 0) {
    return <p className="texto-suave">{vacio}</p>
  }

  return (
    <ul className="lista-productos-admin">
      {ofertas.map((oferta) => (
        <li
          key={oferta.id}
          className={`tarjeta oferta-admin-item producto-admin-item--clicable${
            oferta.en_inicio ? ' oferta-admin-item--en-inicio' : ''
          }`}
          onClick={() => onEditar(oferta)}
        >
          <div className="producto-admin-item__info">
            <strong className="producto-admin-item__nombre" title={oferta.titulo}>
              {oferta.titulo}
            </strong>
            <span className="texto-suave producto-admin-item__categoria">{oferta.subtitulo || 'Sin descripción'}</span>
            {detalle && <span className="oferta-admin-item__tipo">{detalle}</span>}
            <span className="producto-admin-item__etiquetas">
              {oferta.en_inicio && <span className="producto-admin-item__etiqueta oferta-admin-item__en-inicio">★ En Inicio</span>}
              {!oferta.activa && (
                <span className="producto-admin-item__etiqueta producto-admin-item__etiqueta--agotado">Inactiva</span>
              )}
            </span>
          </div>
          <div className="producto-admin-item__acciones" onClick={(evento) => evento.stopPropagation()}>
            <Interruptor
              activo={oferta.activa}
              etiqueta={oferta.activa ? 'Activa' : 'Inactiva'}
              onCambiar={(valor) => onCambiarActiva(oferta.id, valor)}
            />
            {oferta.activa && !oferta.en_inicio && (
              <button type="button" className="oferta-admin-item__inicio" onClick={() => onPonerEnInicio(oferta.id)}>
                Mostrar en Inicio
              </button>
            )}
            {!fija && (
              <button type="button" className="carrito__quitar" onClick={() => onEliminar(oferta)}>
                Eliminar
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
