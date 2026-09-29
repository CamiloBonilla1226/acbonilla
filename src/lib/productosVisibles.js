// Oculta productos cuya categoría fue desactivada o no es visible en la carta indicada
// (ver `activo`/`visible_domicilios`/`visible_carta_fisica` en categorias), aunque no se
// esté filtrando la carta por esa categoría puntual. La visibilidad de la categoría manda
// primero: si la categoría no aparece en esa carta, sus productos tampoco, aunque el
// producto sí esté marcado como visible ahí. Un producto sin categoría (categoria_id null
// → `categoria` viene null en el embed de Supabase) siempre se muestra.
export function filtrarProductosVisibles(productos, campoVisibilidad) {
  return productos.filter(
    (producto) =>
      !producto.categoria ||
      (producto.categoria.activo !== false && producto.categoria[campoVisibilidad] !== false)
  )
}

// Productos marcados manualmente como destacados desde el admin (ver FormularioProducto.jsx),
// para el carrusel de Inicio de la carta de domicilios. `max` limita a 5 por defecto porque
// esa es la cantidad de tarjetas que pide el diseño del carrusel.
export function productosDestacados(productos, max = 5) {
  return productos.filter((producto) => producto.destacado).slice(0, max)
}
