import { evaluarOfertas, formatoPrecio } from '../../lib/tiposOferta'

// Barra por cada oferta activa con una meta de compra (ej. domicilio gratis desde $X, ver
// lib/tiposOferta.js) que se llena a medida que el pedido crece.
function ProgresoOfertas({ ofertas, total }) {
  const estados = evaluarOfertas(ofertas, total).filter((estado) => estado.meta > 0)
  if (estados.length === 0) return null

  return (
    <div className="progreso-ofertas">
      {estados.map(({ oferta, meta, completado, mensaje }) => (
        <div
          key={oferta.id}
          className={`progreso-oferta${completado ? ' progreso-oferta--completa' : ''}`}
          role="status"
        >
          <p className="progreso-oferta__mensaje">{mensaje}</p>
          <div
            className="progreso-oferta__pista"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={meta}
            aria-valuenow={Math.min(total, meta)}
            aria-label={oferta.titulo}
          >
            <span className="progreso-oferta__relleno" style={{ width: `${Math.min(100, (total / meta) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Carrito({ items, total, ofertas = [], onQuitar, onCambiarCantidad, onIrACheckout }) {
  if (items.length === 0) {
    return <p className="texto-suave carrito__vacio">Tu carrito está vacío. Agrega productos desde la carta.</p>
  }

  return (
    <div className="carrito">
      <ProgresoOfertas ofertas={ofertas} total={total} />
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
