import { useState } from 'react'
import { negocioConfig } from '../config/negocio.config'
import { CategoriaFiltro } from '../components/menu/CategoriaFiltro'
import { ProductoCard } from '../components/menu/ProductoCard'
import { ListaAdiciones } from '../components/menu/ListaAdiciones'
import { DetalleProductoFisico } from '../components/menu/DetalleProductoFisico'
import { useCategorias } from '../hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { useAdiciones } from '../hooks/useAdiciones'
import { alSoltarFondo } from '../lib/superposicion'
import { filtrarProductosVisibles } from '../lib/productosVisibles'

// Pestaña fija que se agrega al final del filtro de categorías (no es una categoría real
// en la base de datos): permite hojear el catálogo de adiciones sin abrir cada producto.
const TAB_ADICIONES = '__adiciones__'

// Carta de solo lectura para el punto físico (QR en mesa): mismo catálogo, sin carrito
// ni checkout. Sin Nav/Footer de navegación hacia domicilios, porque en este modo el
// cliente ya está en el local y no debe verse invitado a "pedir a domicilio".
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
  } = useProductos({
    categoriaId: mostrandoAdiciones ? null : categoriaActivaId,
    soloDisponibles: true,
    soloVisibleCartaFisica: true,
  })
  const productos = filtrarProductosVisibles(productosCargados, 'visible_carta_fisica')
  const { adiciones } = useAdiciones({ soloDisponibles: true, soloVisibleCartaFisica: true })

  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const cerrarDetalle = () => setProductoSeleccionado(null)

  return (
    <main className="contenedor pagina-carta">
      <h1 className="pagina-carta__titulo">{negocioConfig.nombre}</h1>

      {errorCategorias && <p className="campo__error">No se pudieron cargar las categorías.</p>}
      {!cargandoCategorias && (categorias.length > 0 || adiciones.length > 0) && (
        <CategoriaFiltro
          categorias={categorias}
          categoriaActivaId={categoriaActivaId}
          onSeleccionar={setCategoriaActivaId}
          tabsExtra={adiciones.length > 0 ? [{ id: TAB_ADICIONES, etiqueta: 'Adiciones' }] : []}
        />
      )}

      {mostrandoAdiciones ? (
        <ListaAdiciones adiciones={adiciones} soloLectura titulo="Adiciones" />
      ) : (
        <>
          {cargandoProductos && <p className="texto-suave">Cargando productos…</p>}
          {errorProductos && <p className="campo__error">No se pudieron cargar los productos.</p>}
          {!cargandoProductos && !errorProductos && productos.length === 0 && (
            <p className="texto-suave">No hay productos en esta categoría todavía.</p>
          )}

          <div className="grid-productos">
            {productos.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onSeleccionar={setProductoSeleccionado}
                mostrarImagen={false}
              />
            ))}
          </div>
        </>
      )}

      {productoSeleccionado && (
        <div className="superposicion" role="dialog" aria-modal="true" onClick={alSoltarFondo(cerrarDetalle)}>
          <DetalleProductoFisico producto={productoSeleccionado} adiciones={adiciones} onCerrar={cerrarDetalle} />
        </div>
      )}
    </main>
  )
}
