const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function Carrito({ items, total, onQuitar, onCambiarCantidad, onIrACheckout }) {
  if (items.length === 0) {
    return <p className="texto-suave carrito__vacio">Tu carrito está vacío. Agrega productos desde la carta.</p>
  }

  return (
    <div className="carrito">
      <ul className="carrito__lista">
        {items.map((item) => (
          <li key={item.itemId} className="carrito__item">
            <div className="carrito__item-info">
              <strong>{item.nombre}</strong>
              {(item.varianteNombre || item.opcionesElegidas.length > 0) && (
                <span className="texto-suave">
                  {[item.varianteNombre, ...item.opcionesElegidas.map((o) => o.nombre)].filter(Boolean).join(', ')}
                </span>
              )}
              <span className="texto-suave">{formatoPrecio.format(item.subtotal)}</span>
            </div>
            <div className="carrito__item-acciones">
              <div className="selector-cantidad">
                <button type="button" onClick={() => onCambiarCantidad(item.itemId, item.cantidad - 1)}>
                  −
                </button>
                <span>{item.cantidad}</span>
                <button type="button" onClick={() => onCambiarCantidad(item.itemId, item.cantidad + 1)}>
                  +
                </button>
              </div>
              <button type="button" className="carrito__quitar" onClick={() => onQuitar(item.itemId)}>
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="carrito__total">
        <span>Total</span>
        <strong>{formatoPrecio.format(total)}</strong>
      </div>

      <button type="button" className="boton carrito__checkout" onClick={onIrACheckout}>
        Continuar con el pedido
      </button>
    </div>
  )
}
