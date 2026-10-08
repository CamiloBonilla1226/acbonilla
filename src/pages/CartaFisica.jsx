import { useEffect, useMemo, useRef, useState } from 'react'
import { negocioConfig } from '../config/negocio.config'
import { ListaProductosFisica } from '../components/menu/ListaProductosFisica'
import { DetalleProductoFisico } from '../components/menu/DetalleProductoFisico'
import { useCategorias } from '../hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { useAdiciones } from '../hooks/useAdiciones'
import { useCerrarConAtras } from '../hooks/useCerrarConAtras'
import { alSoltarFondo } from '../lib/superposicion'
import { filtrarProductosVisibles, productoEnCategoria } from '../lib/productosVisibles'
import { normalizarTexto } from '../lib/texto'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Ids de secciones que no son categorías reales de la base de datos.
const SECCION_OTROS = '__otros__'
const SECCION_ADICIONES = '__adiciones__'

// Carta de solo lectura para el punto físico (QR en mesa): mismo catálogo, sin carrito ni
// checkout, y sin nada que invite a "pedir a domicilio" (el cliente ya está en el local).
// Toda la carta está en una sola página, por secciones (una por categoría, más "Otros" para
// productos sin categoría y "Adiciones" al final). La barra de arriba queda fija: el buscador
// filtra por nombre y las pestañas llevan a cada sección y marcan en cuál se está al hacer
// scroll — así se hojea como una carta impresa, sin perder de vista dónde se está.
export function CartaFisica() {
  const { categorias, error: errorCategorias } = useCategorias({ soloActivas: true, soloVisibleCartaFisica: true })
  const {
    productos: productosCargados,
    cargando: cargandoProductos,
    error: errorProductos,
  } = useProductos({ soloDisponibles: true, soloVisibleCartaFisica: true })
  const { adiciones } = useAdiciones({ soloDisponibles: true, soloVisibleCartaFisica: true })

  const [busqueda, setBusqueda] = useState('')
  const [seccionActiva, setSeccionActiva] = useState(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const cerrarDetalle = () => setProductoSeleccionado(null)
  // "Atrás" del celular cierra el detalle en vez de salir de la página.
  useCerrarConAtras(Boolean(productoSeleccionado), cerrarDetalle)

  const barraRef = useRef(null)
  const seccionesRef = useRef({})
  // Mientras la página se desplaza sola hacia la sección tocada, la pestaña tocada queda fija
  // (si no, el scroll-spy iría marcando las secciones intermedias).
  const desplazandoHasta = useRef(null)

  const temporizador = useRef(null)

  const productosVisibles = useMemo(
    () => filtrarProductosVisibles(productosCargados, 'visible_carta_fisica'),
    [productosCargados]
  )

  // Un producto puede estar en varias categorías: aparece en cada una de ellas.
  const secciones = useMemo(() => {
    const lista = categorias
      .map((categoria) => ({
        id: categoria.id,
        nombre: categoria.nombre,
        productos: productosVisibles.filter((producto) => productoEnCategoria(producto, categoria.id)),
      }))
      .filter((seccion) => seccion.productos.length > 0)
    const sinCategoria = productosVisibles.filter((producto) => (producto.categorias ?? []).length === 0)
    if (sinCategoria.length > 0) lista.push({ id: SECCION_OTROS, nombre: 'Otros', productos: sinCategoria })
    if (adiciones.length > 0) lista.push({ id: SECCION_ADICIONES, nombre: 'Adiciones', productos: [] })
    return lista
  }, [categorias, productosVisibles, adiciones.length])

  const textoBuscado = normalizarTexto(busqueda.trim())
  const resultados = textoBuscado
    ? productosVisibles.filter((producto) => normalizarTexto(producto.nombre).includes(textoBuscado))
    : null
  const buscando = resultados !== null

  const altoBarra = () => (barraRef.current?.getBoundingClientRect().height ?? 0) + 8

  // Scroll-spy: la sección activa es la última cuyo inicio ya pasó por debajo de la barra fija.
  useEffect(() => {
    if (buscando) return undefined
    let pendiente = null
    const calcular = () => {
      pendiente = null
      if (desplazandoHasta.current) return
      const limite = altoBarra() + 1
      let activa = secciones[0]?.id ?? null
      for (const seccion of secciones) {
        const elemento = seccionesRef.current[seccion.id]
        if (elemento && elemento.getBoundingClientRect().top <= limite) activa = seccion.id
      }
      // Al llegar al final de la página, la última sección (aunque sea corta) cuenta como activa.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        activa = secciones[secciones.length - 1]?.id ?? activa
      }
      setSeccionActiva(activa)
    }
    const alHacerScroll = () => {
      if (pendiente === null) pendiente = requestAnimationFrame(calcular)
    }
    calcular()
    window.addEventListener('scroll', alHacerScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', alHacerScroll)
      if (pendiente !== null) cancelAnimationFrame(pendiente)
    }
  }, [secciones, buscando])

  // La pestaña activa se mantiene visible dentro de la fila de pestañas (scroll horizontal).
  useEffect(() => {
    barraRef.current
      ?.querySelector('.carta-fisica__pestana--activa')
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [seccionActiva])

  const irASeccion = (id) => {
    const elemento = seccionesRef.current[id]
    if (!elemento) return
    setSeccionActiva(id)
    desplazandoHasta.current = id
    const destino = elemento.getBoundingClientRect().top + window.scrollY - altoBarra()
    window.scrollTo({ top: destino, behavior: 'smooth' })
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => {
      desplazandoHasta.current = null
    }, 700)
  }

  return (
    <main className="carta-fisica">
      <header className="carta-fisica__encabezado">
        <img src="/imagenprueba.png" alt="" className="carta-fisica__logo" />
        <div className="contenedor carta-fisica__marca">
          <h1 className="carta-fisica__titulo">{negocioConfig.nombre}</h1>
          <p className="carta-fisica__subtitulo">Carta</p>
        </div>
      </header>

      <div className="carta-fisica__barra" ref={barraRef}>
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
              placeholder="Buscar en la carta"
              aria-label="Buscar en la carta"
            />
            {busqueda && (
              <button type="button" className="carta-fisica__limpiar" onClick={() => setBusqueda('')} aria-label="Borrar búsqueda">
                ×
              </button>
            )}
          </label>

          {!buscando && secciones.length > 1 && (
            <nav className="carta-fisica__pestanas" aria-label="Secciones de la carta">
              {secciones.map((seccion) => (
                <button
                  key={seccion.id}
                  type="button"
                  className={`carta-fisica__pestana${seccionActiva === seccion.id ? ' carta-fisica__pestana--activa' : ''}`}
                  aria-current={seccionActiva === seccion.id ? 'true' : undefined}
                  onClick={() => irASeccion(seccion.id)}
                >
                  {seccion.nombre}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="contenedor carta-fisica__contenido">
        {errorCategorias && <p className="campo__error">No se pudieron cargar las categorías.</p>}
        {errorProductos && <p className="campo__error">No se pudieron cargar los productos.</p>}
        {cargandoProductos && <p className="texto-suave carta-fisica__aviso">Cargando la carta…</p>}

        {buscando ? (
          <section className="carta-fisica__seccion">
            <h2 className="carta-fisica__seccion-titulo">
              {resultados.length === 0
                ? `Sin resultados para "${busqueda.trim()}"`
                : `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}`}
            </h2>
            <ListaProductosFisica productos={resultados} onSeleccionar={setProductoSeleccionado} />
          </section>
        ) : (
          <>
            {!cargandoProductos && !errorProductos && secciones.length === 0 && (
              <p className="texto-suave carta-fisica__aviso">La carta todavía no tiene productos.</p>
            )}
            {secciones.map((seccion) => (
              <section
                key={seccion.id}
                className="carta-fisica__seccion"
                ref={(elemento) => {
                  seccionesRef.current[seccion.id] = elemento
                }}
                aria-labelledby={`seccion-${seccion.id}`}
              >
                <h2 className="carta-fisica__seccion-titulo" id={`seccion-${seccion.id}`}>
                  {seccion.nombre}
                </h2>
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
              </section>
            ))}
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
