import { useState } from 'react'
import { negocioConfig } from '../config/negocio.config'
import { CategoriaFiltro } from '../components/menu/CategoriaFiltro'
import { ListaProductosFisica } from '../components/menu/ListaProductosFisica'
import { ListaAdiciones } from '../components/menu/ListaAdiciones'
import { DetalleProductoFisico } from '../components/menu/DetalleProductoFisico'
import { useCategorias } from '../hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { useAdiciones } from '../hooks/useAdiciones'
import { useCerrarConAtras } from '../hooks/useCerrarConAtras'
import { alSoltarFondo } from '../lib/superposicion'
import { filtrarProductosVisibles, productoEnCategoria } from '../lib/productosVisibles'
import { Creditos } from '../components/layout/Creditos'

// Pestaña fija que se agrega al final del filtro de categorías (no es una categoría real
// en la base de datos): permite hojear el catálogo de adiciones sin abrir cada producto.
const TAB_ADICIONES = '__adiciones__'

// Carta de solo lectura para el punto físico (QR en mesa): mismo catálogo, sin carrito
// ni checkout. Sin Nav/Footer de navegación hacia domicilios (ni el link de WhatsApp del
// negocio), porque en este modo el cliente ya está en el local y no debe verse invitado a
// "pedir a domicilio" — sí lleva los créditos de autoría, igual que el resto de las vistas.
export function CartaFisica() {
  const [categoriaActivaId, setCategoriaActivaId] = useState(null)
  const mostrandoAdiciones = categoriaActivaId === TAB_ADICIONES

  const { categorias, cargando: cargandoCategorias, error: errorCategorias } = useCategorias({
    soloActivas: true,
    soloVisibleCartaFisica: true,
  })
  const {
    productos: productosCargados,
    cargando: cargandoProductos,
    error: errorProductos,
  } = useProductos({ soloDisponibles: true, soloVisibleCartaFisica: true })
  // Un producto puede estar en varias categorías: se filtra aquí en vez de en la consulta.
  const productos = filtrarProductosVisibles(productosCargados, 'visible_carta_fisica').filter(
    (producto) => !categoriaActivaId || mostrandoAdiciones || productoEnCategoria(producto, categoriaActivaId)
  )
  const { adiciones } = useAdiciones({ soloDisponibles: true, soloVisibleCartaFisica: true })

  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const cerrarDetalle = () => setProductoSeleccionado(null)
  // "Atrás" del celular cierra el detalle en vez de salir de la página.
  useCerrarConAtras(Boolean(productoSeleccionado), cerrarDetalle)

  return (
    <main className="contenedor pagina-carta carta-fisica">
      <header className="carta-fisica__encabezado">
        <p className="carta-fisica__kicker">Carta</p>
        <h1 className="carta-fisica__titulo">{negocioConfig.nombre}</h1>
        <span className="carta-fisica__linea" aria-hidden="true" />
      </header>

      {errorCategorias && <p className="campo__error">No se pudieron cargar las categorías.</p>}
      {!cargandoCategorias && (categorias.length > 0 || adiciones.length > 0) && (
        <CategoriaFiltro
          categorias={categorias}
          categoriaActivaId={categoriaActivaId}
          onSeleccionar={setCategoriaActivaId}
          tabsExtra={adiciones.length > 0 ? [{ id: TAB_ADICIONES, etiqueta: 'Adiciones' }] : []}
        />
      )}

      <div className="carta-fisica__contenido">
        {mostrandoAdiciones ? (
          <ListaAdiciones adiciones={adiciones} soloLectura titulo="Adiciones" />
        ) : (
          <>
            {cargandoProductos && <p className="texto-suave">Cargando productos…</p>}
            {errorProductos && <p className="campo__error">No se pudieron cargar los productos.</p>}
            {!cargandoProductos && !errorProductos && productos.length === 0 && (
              <p className="texto-suave carta-fisica__vacio">No hay productos en esta categoría todavía.</p>
            )}

            <ListaProductosFisica productos={productos} onSeleccionar={setProductoSeleccionado} />
          </>
        )}
      </div>

      {productoSeleccionado && (
        <div className="superposicion" role="dialog" aria-modal="true" onClick={alSoltarFondo(cerrarDetalle)}>
          <DetalleProductoFisico producto={productoSeleccionado} adiciones={adiciones} onCerrar={cerrarDetalle} />
        </div>
      )}

      <Creditos />
    </main>
  )
}
