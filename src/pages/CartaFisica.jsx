import { useEffect, useMemo, useRef, useState } from 'react'
import { negocioConfig } from '../config/negocio.config'
import { ListaProductosFisica } from '../components/menu/ListaProductosFisica'
import { DetalleProductoFisico } from '../components/menu/DetalleProductoFisico'
import { useCategorias } from '../hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { useAdiciones } from '../hooks/useAdiciones'
import { useCerrarConAtras } from '../hooks/useCerrarConAtras'
import { useSwipeNavegacion } from '../hooks/useSwipeNavegacion'
import { alSoltarFondo } from '../lib/superposicion'
import { categoriasConProductos, filtrarProductosVisibles, productoEnCategoria } from '../lib/productosVisibles'
import { normalizarTexto } from '../lib/texto'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Ids de secciones que no son categorías reales de la base de datos.
const SECCION_OTROS = '__otros__'
const SECCION_ADICIONES = '__adiciones__'

// El swipe para cambiar de categoría no cuenta si empieza en la fila de pestañas (tiene su
// propio scroll horizontal), en el buscador o dentro del detalle abierto.
const SELECTOR_SIN_SWIPE = '.carta-fisica__pestanas, .superposicion, input'

// Carta de solo lectura para el punto físico (QR en mesa): mismo catálogo, sin carrito ni
// checkout, y sin nada que invite a "pedir a domicilio" (el cliente ya está en el local).
// Se ve una categoría a la vez: las pestañas de la barra fija (o deslizar a los lados)
// cambian de sección. Solo aparecen las categorías con productos, más "Otros" (productos sin
// categoría) y "Adiciones". El buscador busca en toda la carta.
export function CartaFisica() {
  const { categorias: categoriasCargadas, error: errorCategorias } = useCategorias({
    soloActivas: true,
    soloVisibleCartaFisica: true,
  })
  const {
    productos: productosCargados,
    cargando: cargandoProductos,
    error: errorProductos,
  } = useProductos({ soloDisponibles: true, soloVisibleCartaFisica: true })
  const { adiciones } = useAdiciones({ soloDisponibles: true, soloVisibleCartaFisica: true })

  const [busqueda, setBusqueda] = useState('')
  const [seccionElegida, setSeccionElegida] = useState(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const cerrarDetalle = () => setProductoSeleccionado(null)
  // "Atrás" del celular cierra el detalle en vez de salir de la página.
  useCerrarConAtras(Boolean(productoSeleccionado), cerrarDetalle)

  const encabezadoRef = useRef(null)
  const pestanasRef = useRef(null)

  const productosVisibles = useMemo(
    () => filtrarProductosVisibles(productosCargados, 'visible_carta_fisica'),
    [productosCargados]
  )

  // Un producto puede estar en varias categorías: aparece en cada una de ellas.
  const secciones = useMemo(() => {
    const lista = categoriasConProductos(categoriasCargadas, productosVisibles).map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      productos: productosVisibles.filter((producto) => productoEnCategoria(producto, categoria.id)),
    }))
    const sinCategoria = productosVisibles.filter((producto) => (producto.categorias ?? []).length === 0)
    if (sinCategoria.length > 0) lista.push({ id: SECCION_OTROS, nombre: 'Otros', productos: sinCategoria })
    if (adiciones.length > 0) lista.push({ id: SECCION_ADICIONES, nombre: 'Adiciones', productos: [] })
    return lista
  }, [categoriasCargadas, productosVisibles, adiciones.length])

  // La sección elegida, o la primera si todavía no se eligió (o la elegida ya no existe).
  const indiceActivo = Math.max(
    0,
    secciones.findIndex((seccion) => seccion.id === seccionElegida)
  )
  const seccion = secciones[indiceActivo] ?? null

  const textoBuscado = normalizarTexto(busqueda.trim())
  const resultados = textoBuscado
    ? productosVisibles.filter((producto) => normalizarTexto(producto.nombre).includes(textoBuscado))
    : null

  const irASeccion = (indice) => {
    const destino = secciones[indice]
    if (!destino) return
    setSeccionElegida(destino.id)
    setBusqueda('')
  }

  // Al cambiar de sección, si se había bajado, la página vuelve al inicio de la lista (con la
  // barra fija arriba) en vez de dejar al cliente a mitad de una categoría distinta.
  useEffect(() => {
    const altoEncabezado = encabezadoRef.current?.offsetHeight ?? 0
    if (window.scrollY > altoEncabezado) window.scrollTo({ top: altoEncabezado })
    pestanasRef.current
      ?.querySelector('.carta-fisica__pestana--activa')
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [seccion?.id])

  const swipe = useSwipeNavegacion({
    onSwipeIzquierda: () => irASeccion(indiceActivo + 1),
    onSwipeDerecha: () => irASeccion(indiceActivo - 1),
    selectorIgnorar: SELECTOR_SIN_SWIPE,
  })

  return (
    <main
      className="carta-fisica"
      onTouchStart={resultados ? undefined : swipe.onTouchStart}
      onTouchEnd={resultados ? undefined : swipe.onTouchEnd}
    >
      <header className="carta-fisica__encabezado" ref={encabezadoRef}>
        <img src="/imagenprueba.png" alt="" className="carta-fisica__logo" />
        <div className="contenedor carta-fisica__marca">
          <h1 className="carta-fisica__titulo">{negocioConfig.nombre}</h1>
          <p className="carta-fisica__subtitulo">Carta</p>
        </div>
      </header>

      <div className="carta-fisica__barra">
        <div className="contenedor">
          <label className="carta-fisica__buscador">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5" />
            </svg>
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar en toda la carta"
              aria-label="Buscar en toda la carta"
            />
            {busqueda && (
              <button type="button" className="carta-fisica__limpiar" onClick={() => setBusqueda('')} aria-label="Borrar búsqueda">
                ×
              </button>
            )}
          </label>
        </div>

        {secciones.length > 0 && (
          <nav className="carta-fisica__pestanas" aria-label="Categorías de la carta" ref={pestanasRef}>
            {secciones.map((item, indice) => {
              const activa = !resultados && indice === indiceActivo
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`carta-fisica__pestana${activa ? ' carta-fisica__pestana--activa' : ''}`}
                  aria-current={activa ? 'page' : undefined}
                  onClick={() => irASeccion(indice)}
                >
                  {item.nombre}
                  <span className="carta-fisica__pestana-cantidad">
                    {item.id === SECCION_ADICIONES ? adiciones.length : item.productos.length}
                  </span>
                </button>
              )
            })}
          </nav>
        )}
      </div>

      <div className="contenedor carta-fisica__contenido">
        {errorCategorias && <p className="campo__error">No se pudieron cargar las categorías.</p>}
        {errorProductos && <p className="campo__error">No se pudieron cargar los productos.</p>}
        {cargandoProductos && <p className="texto-suave carta-fisica__aviso">Cargando la carta…</p>}

        {resultados ? (
          <section className="carta-fisica__seccion">
            <div className="carta-fisica__seccion-encabezado">
              <h2 className="carta-fisica__seccion-titulo">Resultados</h2>
              <span className="texto-suave">
                {resultados.length === 0
                  ? `Nada coincide con "${busqueda.trim()}"`
                  : `${resultados.length} ${resultados.length === 1 ? 'producto' : 'productos'}`}
              </span>
            </div>
            <ListaProductosFisica productos={resultados} onSeleccionar={setProductoSeleccionado} />
          </section>
        ) : (
          <>
            {!cargandoProductos && !errorProductos && !seccion && (
              <p className="texto-suave carta-fisica__aviso">La carta todavía no tiene productos.</p>
            )}
            {seccion && (
              <section className="carta-fisica__seccion" key={seccion.id} aria-labelledby="carta-fisica-seccion">
                <div className="carta-fisica__seccion-encabezado">
                  <h2 className="carta-fisica__seccion-titulo" id="carta-fisica-seccion">
                    {seccion.nombre}
                  </h2>
                  <span className="texto-suave">
                    {seccion.id === SECCION_ADICIONES
                      ? 'Para acompañar tu pedido'
                      : `${seccion.productos.length} ${seccion.productos.length === 1 ? 'producto' : 'productos'}`}
                  </span>
                </div>
                {seccion.id === SECCION_ADICIONES ? (
                  <ul className="carta-fisica__adiciones">
                    {adiciones.map((adicion) => (
                      <li key={adicion.id}>
                        <span>{adicion.nombre}</span>
                        <span className="texto-suave">
                          {adicion.precio > 0 ? `+ ${formatoPrecio.format(adicion.precio)}` : 'Sin costo'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ListaProductosFisica productos={seccion.productos} onSeleccionar={setProductoSeleccionado} />
                )}

                {/* Al final de una categoría, atajo a la siguiente (no hace falta volver arriba). */}
                {secciones[indiceActivo + 1] && (
                  <button type="button" className="carta-fisica__siguiente" onClick={() => irASeccion(indiceActivo + 1)}>
                    <span className="texto-suave">Siguiente</span>
                    <span>
                      {secciones[indiceActivo + 1].nombre}
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </button>
                )}
              </section>
            )}
          </>
        )}
      </div>

      {productoSeleccionado && (
        <div className="superposicion" role="dialog" aria-modal="true" onClick={alSoltarFondo(cerrarDetalle)}>
          <DetalleProductoFisico producto={productoSeleccionado} adiciones={adiciones} onCerrar={cerrarDetalle} />
        </div>
      )}
    </main>
  )
}
