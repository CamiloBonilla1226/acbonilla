import { CarruselDestacados } from '../menu/CarruselDestacados'
import { evaluarOfertas, formatoPrecio } from '../../lib/tiposOferta'

// Barra por cada oferta activa con una meta de compra (ej. domicilio gratis desde $X, ver
// lib/tiposOferta.js) que se llena a medida que el pedido crece. Sin recuadro: texto corto y
// una línea fina, para que el carrito se vea limpio.
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
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
            <circle cx="9.5" cy="19.5" r="1.3" />
            <circle cx="17" cy="19.5" r="1.3" />
          </svg>
          <strong>Tu carrito está vacío</strong>
          <button type="button" className="carrito__ver-menu" onClick={onVerMenu}>
            Ver el menú
          </button>
        </div>
        <ProgresoOfertas ofertas={ofertas} total={total} />
        {carrusel({ titulo: 'Te recomendamos', subtitulo: null })}
      </div>
    )
  }

  const cantidadTotal = items.reduce((suma, item) => suma + item.cantidad, 0)

  return (
    <div className="carrito">
      <div className="carrito__encabezado">
        <h2>Tu pedido</h2>
        <span className="texto-suave">
          {cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <ProgresoOfertas ofertas={ofertas} total={total} />

      <ul className="carrito__lista">
        {items.map((item) => {
          const detalle = [item.varianteNombre, ...item.opcionesElegidas.map((o) => o.nombre)].filter(Boolean).join(', ')
          return (
            <li key={item.itemId} className="carrito__item">
              <div className="carrito__item-info">
                <span className="carrito__item-nombre">{item.nombre}</span>
                {detalle && <span className="texto-suave carrito__item-detalle">{detalle}</span>}
              </div>
              <span className="carrito__item-precio">{formatoPrecio.format(item.subtotal)}</span>
              {/* Con 1 unidad, el "−" se vuelve una papelera: quita la línea (antes había un
                  botón "Quitar" aparte; se quitó para dejar la fila más limpia). */}
              <div className="carrito__cantidad">
                {item.cantidad === 1 ? (
                  <button type="button" aria-label={`Quitar ${item.nombre}`} onClick={() => onQuitar(item.itemId)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label={`Restar uno de ${item.nombre}`}
                    onClick={() => onCambiarCantidad(item.itemId, item.cantidad - 1)}
                  >
                    −
                  </button>
                )}
                <span aria-label="Cantidad">{item.cantidad}</span>
                <button
                  type="button"
                  aria-label={`Sumar uno de ${item.nombre}`}
                  onClick={() => onCambiarCantidad(item.itemId, item.cantidad + 1)}
                >
                  +
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="carrito__total">
        <span>Total</span>
        <strong>{formatoPrecio.format(total)}</strong>
      </div>

      <button type="button" className="boton carrito__checkout" onClick={onIrACheckout}>
        Continuar con el pedido
      </button>

      {carrusel({ titulo: '¿Algo más?', subtitulo: null })}
    </div>
  )
}
