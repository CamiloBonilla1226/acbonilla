import { useMemo, useState } from 'react'
import { negocioConfig } from '../config/negocio.config'
import { HeaderNegocio } from '../components/layout/HeaderNegocio'
import { NavInferior } from '../components/layout/NavInferior'
import { SobreNosotros } from '../components/layout/SobreNosotros'
import { TarjetaOferta } from '../components/layout/TarjetaOferta'
import { CarruselDestacados } from '../components/menu/CarruselDestacados'
import { BuscadorProductos } from '../components/menu/BuscadorProductos'
import { ProductoListaItem } from '../components/menu/ProductoListaItem'
import { CategoriaFiltro } from '../components/menu/CategoriaFiltro'
import { OpcionesProducto } from '../components/menu/OpcionesProducto'
import { Carrito } from '../components/carrito/Carrito'
import { Checkout } from '../components/carrito/Checkout'
import { useCategorias } from '../hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { useAdiciones } from '../hooks/useAdiciones'
import { useCarrito } from '../hooks/useCarrito'
import { useToast } from '../hooks/useToast'
import { useSwipeNavegacion } from '../hooks/useSwipeNavegacion'
import { useCerrarConAtras } from '../hooks/useCerrarConAtras'
import { alSoltarFondo } from '../lib/superposicion'
import { filtrarProductosVisibles, productosDestacados } from '../lib/productosVisibles'
import { variantesDisponibles } from '../lib/variantes'
import { normalizarTexto } from '../lib/texto'

export function Carta() {
  const [seccion, setSeccion] = useState('inicio') // 'inicio' | 'menu' | 'carrito'
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  const { categorias, cargando: cargandoCategorias, error: errorCategorias } = useCategorias({
    soloActivas: true,
    soloVisibleDomicilios: true,
  })
  const {
    productos: productosCargados,
    cargando: cargandoProductos,
    error: errorProductos,
  } = useProductos({ soloDisponibles: true, soloVisibleDomicilios: true })
  const productosVisibles = filtrarProductosVisibles(productosCargados, 'visible_domicilios')
  const destacados = useMemo(() => productosDestacados(productosVisibles), [productosVisibles])

  const productosMenu = useMemo(() => {
    const textoBuscado = normalizarTexto(busqueda)
    return productosVisibles.filter((producto) => {
      const coincideCategoria = !categoriaSeleccionada || producto.categoria_id === categoriaSeleccionada
      const coincideBusqueda = !textoBuscado || normalizarTexto(producto.nombre).includes(textoBuscado)
      return coincideCategoria && coincideBusqueda
    })
  }, [productosVisibles, categoriaSeleccionada, busqueda])

  const { adiciones } = useAdiciones({ soloDisponibles: true, soloVisibleDomicilios: true })

  // "Atrás" del celular cierra el detalle del producto en vez de salir de la página.
  useCerrarConAtras(Boolean(productoSeleccionado), () => setProductoSeleccionado(null))

  const carrito = useCarrito()
  const mostrarToast = useToast()

  // "Todas" (categoriaSeleccionada === null) cuenta como la primera posición, igual que ya
  // se ve en CategoriaFiltro. El swipe en Menú recorre esta lista antes de cambiar de
  // sección: solo pasa a Carrito/Inicio cuando ya está en el último/primer extremo.
  const categoriasConTodas = useMemo(() => [null, ...categorias.map((c) => c.id)], [categorias])
  const indiceCategoria = categoriasConTodas.indexOf(categoriaSeleccionada)

  const swipe = useSwipeNavegacion({
    onSwipeIzquierda: ({ enNav } = {}) => {
      // Un swipe que arranca sobre el nav inferior cambia de sección directo, incluso en
      // Menú: el dedo ya tocó el control de navegación, no el contenido, así que no tiene
      // sentido recorrer categorías primero.
      if (enNav) {
        if (seccion === 'inicio') setSeccion('menu')
        else if (seccion === 'menu') setSeccion('carrito')
        return
      }
      if (seccion === 'inicio') {
        setSeccion('menu')
      } else if (seccion === 'menu') {
        if (indiceCategoria < categoriasConTodas.length - 1) {
          setCategoriaSeleccionada(categoriasConTodas[indiceCategoria + 1])
        } else {
          setSeccion('carrito')
        }
      }
    },
    onSwipeDerecha: ({ enNav } = {}) => {
      if (enNav) {
        if (seccion === 'carrito') setSeccion('menu')
        else if (seccion === 'menu') setSeccion('inicio')
        return
      }
      if (seccion === 'carrito') {
        setSeccion('menu')
      } else if (seccion === 'menu') {
        if (indiceCategoria > 0) {
          setCategoriaSeleccionada(categoriasConTodas[indiceCategoria - 1])
        } else {
          setSeccion('inicio')
        }
      }
    },
  })

  // Las adiciones son extras opcionales (ver useAdiciones): que el negocio tenga adiciones
  // configuradas no debe forzar el modal de "+" rápido. Solo la variante es obligatoria, así
  // que solo ella determina si hace falta abrir el detalle antes de poder agregar.
  const agregarRapido = (producto) => {
    if (variantesDisponibles(producto).length > 0) {
      setProductoSeleccionado(producto)
    } else {
      carrito.agregarProducto(producto, [], 1)
      mostrarToast('Agregado al carrito')
    }
  }

  const confirmarOpciones = (cantidad, opcionesElegidas, variante) => {
    carrito.agregarProducto(productoSeleccionado, opcionesElegidas, cantidad, variante)
    setProductoSeleccionado(null)
    mostrarToast('Agregado al carrito')
  }

  return (
    <>
      <HeaderNegocio />

      {/* El swipe se escucha en este contenedor, no solo en <main>, para que un gesto que
          arranca sobre el nav inferior (posición fija, pero DOM-hermano de <main>) también
          cambie de sección — antes solo funcionaba si el dedo tocaba primero el contenido. */}
      <div onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
      <main className="contenedor pagina-carta pagina-carta--tabs">
        <section hidden={seccion !== 'inicio'} className="seccion-inicio">
          <img src="/imagenprueba.png" alt={negocioConfig.nombre} className="seccion-inicio__logo" />
          <TarjetaOferta onClick={() => setSeccion('menu')} />
          <CarruselDestacados productos={destacados} onAbrirDetalle={setProductoSeleccionado} />
          <SobreNosotros />
        </section>

        <section hidden={seccion !== 'menu'} className="seccion-menu">
          <BuscadorProductos valor={busqueda} onCambiar={setBusqueda} />

          {errorCategorias && <p className="campo__error">No se pudieron cargar las categorías.</p>}
          {!cargandoCategorias && categorias.length > 0 && (
            <CategoriaFiltro
              categorias={categorias}
              categoriaActivaId={categoriaSeleccionada}
              onSeleccionar={setCategoriaSeleccionada}
            />
          )}

          {cargandoProductos && <p className="texto-suave">Cargando productos…</p>}
          {errorProductos && <p className="campo__error">No se pudieron cargar los productos. Intenta de nuevo.</p>}
          {!cargandoProductos && !errorProductos && productosMenu.length === 0 && (
            <p className="texto-suave">No hay productos que coincidan con la búsqueda.</p>
          )}

          <div className="lista-productos-menu">
            {productosMenu.map((producto) => (
              <ProductoListaItem
                key={producto.id}
                producto={producto}
                onAbrirDetalle={setProductoSeleccionado}
                onAgregarRapido={agregarRapido}
              />
            ))}
          </div>
        </section>

        <section hidden={seccion !== 'carrito'} className="seccion-carrito">
          <Carrito
            items={carrito.items}
            total={carrito.total}
            onQuitar={carrito.quitarItem}
            onCambiarCantidad={carrito.cambiarCantidad}
            onIrACheckout={() => setSeccion('checkout')}
          />
        </section>

        {seccion === 'checkout' && (
          <section className="seccion-checkout">
            <Checkout
              items={carrito.items}
              total={carrito.total}
              onPedidoConfirmado={() => {
                carrito.vaciarCarrito()
                setSeccion('inicio')
              }}
            />
          </section>
        )}
      </main>

      <NavInferior
        seccionActiva={seccion === 'checkout' ? 'carrito' : seccion}
        onCambiarSeccion={setSeccion}
        cantidadTotal={carrito.cantidadTotal}
      />
      </div>

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
    </>
  )
}
