// Un producto puede estar en varias categorías (tabla productos_categorias; useProductos.js
// las deja en `producto.categorias`). Reglas de visibilidad en las cartas públicas:
// - Dentro de una categoría puntual aparece si está en esa categoría (productoEnCategoria).
// - En general ("Todas") aparece si al menos una de sus categorías está activa y visible en
//   esa carta, o si no tiene ninguna categoría. Una categoría desactivada u oculta solo deja
//   de mostrarlo dentro de ella: sigue saliendo en sus otras categorías.
export function filtrarProductosVisibles(productos, campoVisibilidad) {
  return productos.filter((producto) => {
    const categorias = producto.categorias ?? []
    return (
      categorias.length === 0 ||
      categorias.some((categoria) => categoria.activo !== false && categoria[campoVisibilidad] !== false)
    )
  })
}

export function productoEnCategoria(producto, categoriaId) {
  return (producto.categorias ?? []).some((categoria) => categoria.id === categoriaId)
}

// Productos marcados manualmente como destacados desde el admin (ver FormularioProducto.jsx),
// para el carrusel de Inicio de la carta de domicilios. `max` limita a 5 por defecto porque
// esa es la cantidad de tarjetas que pide el diseño del carrusel.
export function productosDestacados(productos, max = 5) {
  return productos.filter((producto) => producto.destacado).slice(0, max)
}
