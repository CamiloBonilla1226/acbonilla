const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const SIGUIENTE_ESTADO = {
  nuevo: 'en_preparacion',
  en_preparacion: 'entregado',
}

const ETIQUETA_ESTADO = {
  nuevo: 'Nuevo',
  en_preparacion: 'En preparación',
  entregado: 'Entregado',
}

export function TablaPedidos({ pedidos, onActualizarEstado }) {
  if (pedidos.length === 0) {
    return <p className="texto-suave">No hay pedidos todavía.</p>
  }

  return (
    <ul className="lista-pedidos">
      {pedidos.map((pedido) => {
        const siguienteEstado = SIGUIENTE_ESTADO[pedido.estado]
        return (
          <li key={pedido.id} className="tarjeta pedido-item">
            <div className="pedido-item__encabezado">
              <strong>{pedido.cliente_nombre}</strong>
              <span className={`pedido-item__estado pedido-item__estado--${pedido.estado}`}>
                {ETIQUETA_ESTADO[pedido.estado]}
              </span>
            </div>
            <span className="texto-suave">{formatoFecha.format(new Date(pedido.creado_en))}</span>
            <span className="texto-suave">{pedido.cliente_telefono}</span>
            {pedido.direccion && <span className="texto-suave">{pedido.direccion}</span>}

            <ul className="pedido-item__detalle">
              {pedido.productos_detalle.map((item, indice) => (
                <li key={indice}>
                  {item.cantidad}x {item.nombre}
                  {item.opciones_elegidas?.length > 0 && ` (${item.opciones_elegidas.map((o) => o.nombre).join(', ')})`}
                </li>
              ))}
            </ul>

            <div className="pedido-item__pie">
              <strong>{formatoPrecio.format(pedido.total)}</strong>
              {siguienteEstado && (
                <button type="button" className="boton boton--pequeno" onClick={() => onActualizarEstado(pedido.id, siguienteEstado)}>
                  Marcar como {ETIQUETA_ESTADO[siguienteEstado].toLowerCase()}
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
