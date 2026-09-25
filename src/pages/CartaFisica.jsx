import { useState } from 'react'
import { negocioConfig } from '../config/negocio.config'
import { CategoriaFiltro } from '../components/menu/CategoriaFiltro'
import { ProductoCard } from '../components/menu/ProductoCard'
import { useCategorias } from '../hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { filtrarProductosVisibles } from '../lib/productosVisibles'

// Carta de solo lectura para el punto físico (QR en mesa): mismo catálogo, sin carrito
// ni checkout. Sin Nav/Footer de navegación hacia domicilios, porque en este modo el
// cliente ya está en el local y no debe verse invitado a "pedir a domicilio".
export function CartaFisica() {
  const [categoriaActivaId, setCategoriaActivaId] = useState(null)
  const { categorias, cargando: cargandoCategorias, error: errorCategorias } = useCategorias({ soloActivas: true })
  const {
    productos: productosCargados,
    cargando: cargandoProductos,
    error: errorProductos,
  } = useProductos({ categoriaId: categoriaActivaId, soloDisponibles: true })
  const productos = filtrarProductosVisibles(productosCargados)

  return (
    <main className="contenedor pagina-carta">
      <h1 className="pagina-carta__titulo">{negocioConfig.nombre}</h1>

      {errorCategorias && <p className="campo__error">No se pudieron cargar las categorías.</p>}
      {!cargandoCategorias && categorias.length > 0 && (
        <CategoriaFiltro
          categorias={categorias}
          categoriaActivaId={categoriaActivaId}
          onSeleccionar={setCategoriaActivaId}
        />
      )}

      {cargandoProductos && <p className="texto-suave">Cargando productos…</p>}
      {errorProductos && <p className="campo__error">No se pudieron cargar los productos.</p>}
      {!cargandoProductos && !errorProductos && productos.length === 0 && (
        <p className="texto-suave">No hay productos en esta categoría todavía.</p>
      )}

      <div className="grid-productos">
        {productos.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} interactivo={false} />
        ))}
      </div>
    </main>
  )
}
