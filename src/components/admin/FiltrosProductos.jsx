import { FiltrosAdmin, GrupoFiltro } from './FiltrosAdmin'
import { precioMinimo, variantesDisponibles } from '../../lib/variantes'

export const FILTROS_PRODUCTOS_INICIALES = {
  estado: 'todos',
  carta: 'todas',
  destacados: 'todos',
  orden: 'nombre',
}

// Precio con el que se ordena un producto: el mismo que muestra la tarjeta (mínimo de sus
// variantes disponibles, o precio de oferta / precio normal si no tiene variantes).
function precioDe(producto) {
  const variantes = variantesDisponibles(producto)
  return variantes.length > 0 ? precioMinimo(variantes) : Number(producto.precio_oferta ?? producto.precio) || 0
}

export function aplicarFiltrosProductos(productos, filtros) {
  const filtrados = productos.filter((producto) => {
    if (filtros.estado === 'activos' && !producto.disponible) return false
    if (filtros.estado === 'desactivados' && producto.disponible) return false
    if (filtros.carta === 'domicilios' && !producto.visible_domicilios) return false
    if (filtros.carta === 'fisica' && !producto.visible_carta_fisica) return false
    if (filtros.destacados === 'destacados' && !producto.destacado) return false
    return true
  })

  if (filtros.orden === 'mayor-precio') return [...filtrados].sort((a, b) => precioDe(b) - precioDe(a))
  if (filtros.orden === 'menor-precio') return [...filtrados].sort((a, b) => precioDe(a) - precioDe(b))
  return filtrados
}

export function FiltrosProductos({ filtros, onCambiar, total, mostrados }) {
  const cambiar = (clave) => (valor) => onCambiar({ ...filtros, [clave]: valor })
  const hayFiltros = Object.keys(FILTROS_PRODUCTOS_INICIALES).some(
    (clave) => filtros[clave] !== FILTROS_PRODUCTOS_INICIALES[clave]
  )

  return (
    <FiltrosAdmin
      total={total}
      mostrados={mostrados}
      hayFiltros={hayFiltros}
      onLimpiar={() => onCambiar(FILTROS_PRODUCTOS_INICIALES)}
    >
      <GrupoFiltro
        titulo="Estado"
        valor={filtros.estado}
        onCambiar={cambiar('estado')}
        opciones={[
          { valor: 'todos', texto: 'Todos' },
          { valor: 'activos', texto: 'Activados' },
          { valor: 'desactivados', texto: 'Desactivados' },
        ]}
      />
      <GrupoFiltro
        titulo="Carta"
        valor={filtros.carta}
        onCambiar={cambiar('carta')}
        opciones={[
          { valor: 'todas', texto: 'Todas' },
          { valor: 'domicilios', texto: 'Domicilios' },
          { valor: 'fisica', texto: 'Carta física' },
        ]}
      />
      <GrupoFiltro
        titulo="Destacado"
        valor={filtros.destacados}
        onCambiar={cambiar('destacados')}
        opciones={[
          { valor: 'todos', texto: 'Todos' },
          { valor: 'destacados', texto: '★ Solo destacados' },
        ]}
      />
      <GrupoFiltro
        titulo="Ordenar"
        valor={filtros.orden}
        onCambiar={cambiar('orden')}
        opciones={[
          { valor: 'nombre', texto: 'Nombre' },
          { valor: 'mayor-precio', texto: 'Mayor precio' },
          { valor: 'menor-precio', texto: 'Menor precio' },
        ]}
      />
    </FiltrosAdmin>
  )
}
