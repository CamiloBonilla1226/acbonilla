import { useCallback, useMemo, useState } from 'react'

// Cuando el producto tiene variante elegida (tamaño, sabor), su precio manda: el
// precio_oferta de productos deja de aplicar (ver FormularioProducto.jsx).
function precioEfectivo(producto, variante) {
  if (variante) return variante.precio
  return producto.precio_oferta ?? producto.precio
}

function idOpciones(opcionesElegidas) {
  return opcionesElegidas
    .map((o) => o.id)
    .sort()
    .join(',')
}

// Dos selecciones idénticas del mismo producto (mismo producto + misma variante + mismas
// opciones) se agrupan en una sola línea del carrito, sumando cantidad, en vez de duplicar
// filas. Variantes distintas del mismo producto quedan en líneas separadas.
function construirItemId(productoId, varianteId, opcionesElegidas) {
  return `${productoId}|${varianteId ?? ''}|${idOpciones(opcionesElegidas)}`
}

function calcularSubtotal(precioBase, opcionesElegidas, cantidad) {
  const extras = opcionesElegidas.reduce((suma, o) => suma + (o.precio_extra ?? 0), 0)
  return (precioBase + extras) * cantidad
}

export function useCarrito() {
  const [items, setItems] = useState([])

  const agregarProducto = useCallback((producto, opcionesElegidas = [], cantidad = 1, variante = null) => {
    const itemId = construirItemId(producto.id, variante?.id, opcionesElegidas)
    const precioBase = precioEfectivo(producto, variante)

    setItems((actuales) => {
      const existente = actuales.find((item) => item.itemId === itemId)

      if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad
        return actuales.map((item) =>
          item.itemId === itemId
            ? {
                ...item,
                cantidad: nuevaCantidad,
                subtotal: calcularSubtotal(precioBase, opcionesElegidas, nuevaCantidad),
              }
            : item
        )
      }

      return [
        ...actuales,
        {
          itemId,
          productoId: producto.id,
          nombre: producto.nombre,
          varianteNombre: variante?.nombre ?? null,
          precioBase,
          cantidad,
          opcionesElegidas,
          subtotal: calcularSubtotal(precioBase, opcionesElegidas, cantidad),
        },
      ]
    })
  }, [])

  const quitarItem = useCallback((itemId) => {
    setItems((actuales) => actuales.filter((item) => item.itemId !== itemId))
  }, [])

  const cambiarCantidad = useCallback((itemId, cantidad) => {
    if (cantidad <= 0) {
      setItems((actuales) => actuales.filter((item) => item.itemId !== itemId))
      return
    }

    setItems((actuales) =>
      actuales.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              cantidad,
              subtotal: calcularSubtotal(item.precioBase, item.opcionesElegidas, cantidad),
            }
          : item
      )
    )
  }, [])

  const vaciarCarrito = useCallback(() => setItems([]), [])

  const total = useMemo(() => items.reduce((suma, item) => suma + item.subtotal, 0), [items])
  const cantidadTotal = useMemo(() => items.reduce((suma, item) => suma + item.cantidad, 0), [items])

  return {
    items,
    total,
    cantidadTotal,
    agregarProducto,
    quitarItem,
    cambiarCantidad,
    vaciarCarrito,
  }
}
