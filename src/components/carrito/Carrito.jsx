import { CarruselDestacados } from '../menu/CarruselDestacados'
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

// `recomendados` (ver productosRecomendados): con el carrito vacío ocupan la pantalla como
// sugerencia para empezar; con productos, van en un carrusel debajo del total para sumar más
// sin volver al Menú. `onAbrirDetalle`/`onAgregarRapido` son los mismos del Menú.
export function Carrito({
  items,
  total,
  ofertas = [],
  recomendados = [],
  onQuitar,
  onCambiarCantidad,
  onIrACheckout,
  onAbrirDetalle,
  onAgregarRapido,
  onVerMenu,
}) {
  const carrusel = (props) => (
    <CarruselDestacados
      productos={recomendados}
      onAbrirDetalle={onAbrirDetalle}
      onAgregarRapido={onAgregarRapido}
      variante="carrito"
      {...props}
    />
  )

  if (items.length === 0) {
    return (
      <div className="carrito carrito--vacio">
        <div className="carrito__vacio">
          <span className="carrito__vacio-icono" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
              <circle cx="9.5" cy="19.5" r="1.3" />
              <circle cx="17" cy="19.5" r="1.3" />
            </svg>
          </span>
          <strong>Tu carrito está vacío</strong>
          <span className="texto-suave">Empieza con alguno de estos o explora toda la carta.</span>
        </div>
        <ProgresoOfertas ofertas={ofertas} total={total} />
        {carrusel({ titulo: 'Te recomendamos', subtitulo: 'Toca + para agregar al carrito' })}
        <button type="button" className="boton boton--secundario carrito__ver-menu" onClick={onVerMenu}>
          Ver el menú completo
        </button>
      </div>
    )
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

      {carrusel({ titulo: '¿Algo más?', subtitulo: 'Agrégalo a tu pedido sin salir del carrito' })}
    </div>
  )
}
