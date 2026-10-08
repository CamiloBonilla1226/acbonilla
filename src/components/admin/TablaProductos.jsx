import { Interruptor } from './Interruptor'
import { ImagenProducto } from '../menu/ImagenProducto'
import { precioMinimo, variantesDisponibles } from '../../lib/variantes'
import { useMantenerPresionado } from '../../hooks/useMantenerPresionado'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Selección para las acciones masivas de Productos.jsx: mantener presionado un producto lo
// selecciona; mientras haya al menos uno seleccionado, tocar una tarjeta la marca o desmarca
// en vez de abrir el editor (como en las apps de galería o de correo). La tarjeta conserva su
// diseño; la selección solo se ve con un borde resaltado.
export function TablaProductos({
  productos,
  seleccionados,
  onMantenerPresionado,
  onAlternarSeleccion,
  onEditar,
  onEliminar,
  onToggleDisponible,
}) {
  const presion = useMantenerPresionado(onMantenerPresionado, { ignorar: '.producto-admin-item__acciones' })

  if (productos.length === 0) {
    return <p className="texto-suave">No hay productos para mostrar.</p>
  }

  const modoSeleccion = seleccionados.size > 0

  return (
    <ul className="lista-productos-admin">
      {productos.map((producto) => {
        const variantes = variantesDisponibles(producto)
        const seleccionado = seleccionados.has(producto.id)
        const nombresCategorias = producto.categorias.map((categoria) => categoria.nombre).join(' · ')
        return (
          <li
            key={producto.id}
            className={`tarjeta producto-admin-item producto-admin-item--clicable${
              seleccionado ? ' producto-admin-item--seleccionado' : ''
            }`}
            aria-selected={modoSeleccion ? seleccionado : undefined}
            {...presion(producto.id)}
            onClick={() => (modoSeleccion ? onAlternarSeleccion(producto.id) : onEditar(producto))}
          >
            <div className="producto-admin-item__imagen">
              <ImagenProducto src={producto.imagen_url} alt={producto.nombre} />
            </div>
            <div className="producto-admin-item__info">
              <strong className="producto-admin-item__nombre" title={producto.nombre}>
                {producto.nombre}
              </strong>
              <span className="texto-suave producto-admin-item__categoria" title={nombresCategorias}>
                {nombresCategorias || 'Sin categoría'}
              </span>
              <span className="producto-admin-item__precio">
                {variantes.length > 0
                  ? `Desde ${formatoPrecio.format(precioMinimo(variantes))}`
                  : formatoPrecio.format(producto.precio_oferta ?? producto.precio)}
              </span>
              <span className="producto-admin-item__etiquetas">
                {producto.destacado && <span className="producto-admin-item__etiqueta">★ Destacado</span>}
                {!producto.disponible && (
                  <span className="producto-admin-item__etiqueta producto-admin-item__etiqueta--agotado">
                    Agotado
                  </span>
                )}
              </span>
            </div>
            <div className="producto-admin-item__acciones" onClick={(evento) => evento.stopPropagation()}>
              <Interruptor
                activo={producto.disponible}
                onCambiar={(valor) => onToggleDisponible(producto.id, valor)}
              />
              <button type="button" className="carrito__quitar" onClick={() => onEliminar(producto.id)}>
                Eliminar
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
