// Tipos de oferta: qué hace cada oferta además de mostrarse en la tarjeta de Inicio. La
// oferta guarda su `tipo` y sus parámetros en `configuracion` (tabla ofertas, ver
// explicacion-script-bd.txt sección 17); el comportamiento vive aquí, en el código.
//
// Para agregar un tipo nuevo: sumar una entrada con
// - etiqueta / descripcion: lo que ve el dueño al elegirlo en el formulario.
// - campos: parámetros que el dueño configura (`tipo: 'dinero'` muestra un input numérico).
// - resumen(config): texto corto para la lista de ofertas del panel.
// - evaluar(config, total) (opcional): estado de la oferta para el total actual del carrito:
//   { meta, completado, mensaje } — si devuelve `meta`, el carrito muestra una barra de
//   progreso — y `lineaWhatsapp` (texto o null) para el mensaje del pedido.
// No hace falta tocar la base de datos.

export const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export const TIPOS_OFERTA = {
  informativa: {
    etiqueta: 'Solo informativa',
    descripcion: 'Solo muestra el título y el subtítulo en la tarjeta de Inicio.',
    campos: [],
    resumen: () => 'Solo informativa',
  },

  domicilio_gratis: {
    etiqueta: 'Domicilio gratis desde un monto',
    descripcion:
      'En el carrito aparece una barra que se llena con el pedido. Al llegar al monto, el mensaje de WhatsApp avisa que el pedido tiene domicilio gratis.',
    campos: [{ clave: 'monto_minimo', etiqueta: 'Compra mínima para el domicilio gratis', tipo: 'dinero' }],
    resumen: (config) => `Domicilio gratis desde ${formatoPrecio.format(config.monto_minimo ?? 0)}`,
    evaluar: (config, total) => {
      const meta = Number(config.monto_minimo) || 0
      const completado = total >= meta
      return {
        meta,
        completado,
        mensaje: completado
          ? '¡Tu pedido tiene domicilio gratis!'
          : `Te faltan ${formatoPrecio.format(meta - total)} para el domicilio gratis`,
        lineaWhatsapp: completado
          ? `Oferta aplicada: Domicilio gratis (compras desde ${formatoPrecio.format(meta)})`
          : null,
      }
    },
  },
}

export const tipoDeOferta = (oferta) => TIPOS_OFERTA[oferta.tipo] ?? TIPOS_OFERTA.informativa

// Valida los parámetros del tipo elegido antes de guardar; devuelve un mensaje o null.
export function validarConfiguracion(tipo, configuracion) {
  for (const campo of TIPOS_OFERTA[tipo]?.campos ?? []) {
    const valor = configuracion[campo.clave]
    if (campo.tipo === 'dinero' && !(Number(valor) > 0)) {
      return `Ingresa un valor mayor a 0 en "${campo.etiqueta}".`
    }
  }
  return null
}

// Estado de cada oferta activa con comportamiento para el total del carrito.
export function evaluarOfertas(ofertas, total) {
  return ofertas
    .map((oferta) => {
      const tipo = tipoDeOferta(oferta)
      return tipo.evaluar ? { oferta, ...tipo.evaluar(oferta.configuracion ?? {}, total) } : null
    })
    .filter(Boolean)
}
