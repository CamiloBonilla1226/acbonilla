import { useState } from 'react'
import { Nav } from '../components/layout/Nav'
import { Footer } from '../components/layout/Footer'
import { CategoriaFiltro } from '../components/menu/CategoriaFiltro'
import { ProductoCard } from '../components/menu/ProductoCard'
import { OpcionesProducto } from '../components/menu/OpcionesProducto'
import { Carrito } from '../components/carrito/Carrito'
import { Checkout } from '../components/carrito/Checkout'
import { useCategorias } from '../hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { useAdiciones } from '../hooks/useAdiciones'
import { useCarrito } from '../hooks/useCarrito'
import { useSwipeParaCerrar } from '../hooks/useSwipeParaCerrar'
import { alSoltarFondo } from '../lib/superposicion'
import { filtrarProductosVisibles } from '../lib/productosVisibles'
import { variantesDisponibles } from '../lib/variantes'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function Carta() {
  const [categoriaActivaId, setCategoriaActivaId] = useState(null)
  const { categorias, cargando: cargandoCategorias, error: errorCategorias } = useCategorias({
    soloActivas: true,
    soloVisibleDomicilios: true,
  })
  const {
    productos: productosCargados,
    cargando: cargandoProductos,
    error: errorProductos,
  } = useProductos({ categoriaId: categoriaActivaId, soloDisponibles: true, soloVisibleDomicilios: true })
  const productos = filtrarProductosVisibles(productosCargados, 'visible_domicilios')
  const { adiciones } = useAdiciones({ soloDisponibles: true, soloVisibleDomicilios: true })

  const carrito = useCarrito()
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [vista, setVista] = useState('cerrado') // 'cerrado' | 'carrito' | 'checkout'

  const manejarSeleccionProducto = (producto) => {
    // Si el producto tiene variantes (tamaños, sabores), elegir una es obligatorio, así que
    // se fuerza el modal aunque no haya adiciones.
    if (adiciones.length > 0 || variantesDisponibles(producto).length > 0) {
      setProductoSeleccionado(producto)
    } else {
      carrito.agregarProducto(producto, [], 1)
    }
  }

  const confirmarOpciones = (cantidad, opcionesElegidas, variante) => {
    carrito.agregarProducto(productoSeleccionado, opcionesElegidas, cantidad, variante)
    setProductoSeleccionado(null)
  }

  const cerrarVista = () => setVista('cerrado')
  const swipeCarritoCheckout = useSwipeParaCerrar(cerrarVista)

  return (
    <>
      <Nav />
      <main className="contenedor pagina-carta">
        {errorCategorias && <p className="campo__error">No se pudieron cargar las categorías.</p>}
        {!cargandoCategorias && categorias.length > 0 && (
          <CategoriaFiltro
            categorias={categorias}
            categoriaActivaId={categoriaActivaId}
            onSeleccionar={setCategoriaActivaId}
          />
        )}

        {cargandoProductos && <p className="texto-suave">Cargando productos…</p>}
        {errorProductos && <p className="campo__error">No se pudieron cargar los productos. Intenta de nuevo.</p>}
        {!cargandoProductos && !errorProductos && productos.length === 0 && (
          <p className="texto-suave">No hay productos en esta categoría todavía.</p>
        )}

        <div className="grid-productos">
          {productos.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              interactivo
              onSeleccionar={manejarSeleccionProducto}
            />
          ))}
        </div>
      </main>
      <Footer />

      {carrito.cantidadTotal > 0 && vista === 'cerrado' && (
        <button type="button" className="boton carrito-flotante" onClick={() => setVista('carrito')}>
          Ver carrito · {carrito.cantidadTotal} · {formatoPrecio.format(carrito.total)}
        </button>
      )}

      {productoSeleccionado && (
        <div
          className="superposicion"
          role="dialog"
          aria-modal="true"
          onClick={alSoltarFondo(() => setProductoSeleccionado(null))}
        >
          <OpcionesProducto
            producto={productoSeleccionado}
            adiciones={adiciones}
            onConfirmar={confirmarOpciones}
            onCancelar={() => setProductoSeleccionado(null)}
          />
        </div>
      )}

      {vista !== 'cerrado' && (
        <div className="superposicion" role="dialog" aria-modal="true" onClick={alSoltarFondo(cerrarVista)}>
          <div
            className="superposicion__panel"
            style={swipeCarritoCheckout.estilo}
            onTouchStart={swipeCarritoCheckout.onTouchStart}
            onTouchMove={swipeCarritoCheckout.onTouchMove}
            onTouchEnd={swipeCarritoCheckout.onTouchEnd}
          >
            <button type="button" className="superposicion__cerrar" onClick={cerrarVista}>
              Cerrar
            </button>

            {vista === 'carrito' && (
              <Carrito
                items={carrito.items}
                total={carrito.total}
                onQuitar={carrito.quitarItem}
                onCambiarCantidad={carrito.cambiarCantidad}
                onIrACheckout={() => setVista('checkout')}
              />
            )}

            {vista === 'checkout' && (
              <Checkout
                items={carrito.items}
                total={carrito.total}
                onPedidoConfirmado={() => {
                  carrito.vaciarCarrito()
                  setVista('cerrado')
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
