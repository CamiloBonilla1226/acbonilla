// Oculta productos cuya categoría fue desactivada (ver `activo` en categorias), aunque no
// se esté filtrando la carta por esa categoría puntual. Un producto sin categoría
// (categoria_id null → `categoria` viene null en el embed de Supabase) siempre se muestra.
export function filtrarProductosVisibles(productos) {
  return productos.filter((producto) => !producto.categoria || producto.categoria.activo !== false)
}
