const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function construirMensajePedido({ items, total, cliente }) {
  const lineas = items.map((item) => {
    const opciones = item.opcionesElegidas.length
      ? ` (${item.opcionesElegidas.map((o) => o.nombre).join(', ')})`
      : ''
    return `• ${item.cantidad}x ${item.nombre}${opciones} — ${formatoPrecio.format(item.subtotal)}`
  })

  return [
    `Pedido de ${cliente.nombre}`,
    `Teléfono: ${cliente.telefono}`,
    cliente.direccion ? `Dirección: ${cliente.direccion}` : null,
    '',
    ...lineas,
    '',
    `Total: ${formatoPrecio.format(total)}`,
  ]
    .filter((linea) => linea !== null)
    .join('\n')
}

export function construirLinkWhatsApp(numeroWhatsapp, mensaje) {
  const numeroLimpio = numeroWhatsapp.replace(/\D/g, '')
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`
}
