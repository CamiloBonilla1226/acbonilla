// Análisis del negocio a partir de los pedidos, sin IA externa ni costo: todo se calcula en
// el navegador con los datos que el panel ya tiene. Las "recomendaciones" son reglas
// simples (umbrales sobre los números), no predicciones — por eso solo se generan cuando
// hay datos suficientes para que tengan sentido.

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MS_DIA = 24 * 60 * 60 * 1000

// Ventana para hablar de "qué días se compra más": un mes tiene pocas repeticiones de cada
// día de la semana, así que se miran los últimos 90 días.
const DIAS_VENTANA = 90
const MIN_PEDIDOS_ANALISIS = 10
const MIN_UNIDADES_PRODUCTO_DIA = 3

// Un pedido rechazado no es venta; los demás estados (incluido "nuevo", aún sin atender) sí
// cuentan como demanda real del cliente.
const esVenta = (pedido) => pedido.estado !== 'rechazado'

const formatoDinero = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})
const dinero = (valor) => formatoDinero.format(valor)

// Los días terminados en s (lunes...viernes) no cambian en plural; sábado/domingo sí.
const plural = (dia) => (dia.endsWith('s') ? dia : dia + 's')

function nombreMes(fecha) {
  return new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(fecha)
}

export function analizarNegocio(pedidos, productos = [], ahora = new Date()) {
  const ventas = pedidos.filter(esVenta)

  // ---- Dinero del mes (mes calendario en curso) y comparación con el anterior ----
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
  const diaDelMes = ahora.getDate()
  // Para comparar justo: mismo tramo del mes anterior (del 1 al mismo día), no el mes completo.
  const finTramoAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, diaDelMes + 1)

  let totalMes = 0
  let pedidosMes = 0
  let totalMesAnterior = 0
  for (const pedido of ventas) {
    const fecha = new Date(pedido.creado_en)
    if (fecha >= inicioMes) {
      totalMes += Number(pedido.total) || 0
      pedidosMes += 1
    } else if (fecha >= inicioMesAnterior && fecha < finTramoAnterior) {
      totalMesAnterior += Number(pedido.total) || 0
    }
  }
  const variacion = totalMesAnterior > 0 ? ((totalMes - totalMesAnterior) / totalMesAnterior) * 100 : null

  // ---- Ventana de 90 días para patrones por día de la semana y por producto ----
  const desde = new Date(ahora.getTime() - DIAS_VENTANA * MS_DIA)
  const recientes = ventas.filter((pedido) => new Date(pedido.creado_en) >= desde)

  const porDia = DIAS.map((nombre) => ({ nombre, pedidos: 0, total: 0 }))
  const unidadesProducto = new Map() // nombre -> { unidades, dias: number[7] }
  for (const pedido of recientes) {
    const dia = new Date(pedido.creado_en).getDay()
    porDia[dia].pedidos += 1
    porDia[dia].total += Number(pedido.total) || 0

    for (const item of pedido.productos_detalle ?? []) {
      const registro = unidadesProducto.get(item.nombre) ?? { unidades: 0, dias: Array(7).fill(0) }
      const cantidad = Number(item.cantidad) || 0
      registro.unidades += cantidad
      registro.dias[dia] += cantidad
      unidadesProducto.set(item.nombre, registro)
    }
  }

  const topProductos = [...unidadesProducto.entries()]
    .map(([nombre, { unidades, dias }]) => {
      const mejorDia = dias.indexOf(Math.max(...dias))
      return { nombre, unidades, mejorDia: DIAS[mejorDia], unidadesMejorDia: dias[mejorDia] }
    })
    .sort((a, b) => b.unidades - a.unidades)

  const suficientesDatos = recientes.length >= MIN_PEDIDOS_ANALISIS

  const diaMasFuerte = [...porDia].sort((a, b) => b.pedidos - a.pedidos)[0]
  const diaMasFlojo = [...porDia].sort((a, b) => a.pedidos - b.pedidos)[0]
  const maxPedidosDia = diaMasFuerte.pedidos

  const ticketPromedio = ventas.length > 0 ? ventas.reduce((s, p) => s + (Number(p.total) || 0), 0) / ventas.length : 0

  // Productos disponibles sin una sola venta en la ventana: candidatos a oferta o a destacar.
  const vendidos = new Set(unidadesProducto.keys())
  const sinVentas = productos.filter((p) => p.disponible && !vendidos.has(p.nombre)).map((p) => p.nombre)

  // ---- Recomendaciones ----
  const recomendaciones = []

  if (!suficientesDatos) {
    recomendaciones.push({
      titulo: 'Aún hay pocos datos',
      texto: `Con ${recientes.length} pedidos en los últimos ${DIAS_VENTANA} días todavía no se pueden detectar patrones fiables. A medida que lleguen más pedidos, aquí aparecerán recomendaciones sobre días, productos y ofertas.`,
    })
  } else {
    if (diaMasFlojo.pedidos < diaMasFuerte.pedidos * 0.6) {
      const estrella = topProductos[0]?.nombre
      recomendaciones.push({
        titulo: `Impulsa los ${plural(diaMasFlojo.nombre)}`,
        texto: `Es el día con menos domicilios (${diaMasFlojo.pedidos} pedidos en ${DIAS_VENTANA} días, frente a ${diaMasFuerte.pedidos} los ${plural(diaMasFuerte.nombre)}). Prueba una promoción solo para ese día${
          estrella ? `, por ejemplo un descuento o combo con ${estrella}` : ''
        }, o envío gratis, y anúnciala por WhatsApp e Instagram la víspera.`,
      })
    }

    recomendaciones.push({
      titulo: `Refuerza los ${plural(diaMasFuerte.nombre)}`,
      texto: `Es tu día más fuerte (${diaMasFuerte.pedidos} pedidos). Asegúrate de tener inventario y personal suficiente, y aprovecha para ofrecer adiciones y combos que suban el valor de cada pedido.`,
    })

    const estrella = topProductos[0]
    if (estrella) {
      recomendaciones.push({
        titulo: `${estrella.nombre} es tu producto estrella`,
        texto: `Se han vendido ${estrella.unidades} unidades en ${DIAS_VENTANA} días. Márcalo como destacado y úsalo de gancho: ofertas combinadas con productos de menor rotación suelen ayudar a moverlos.`,
      })
    }

    if (sinVentas.length > 0) {
      const lista = sinVentas.slice(0, 3).join(', ')
      recomendaciones.push({
        titulo: 'Productos que no se están vendiendo',
        texto: `${lista}${sinVentas.length > 3 ? ` y ${sinVentas.length - 3} más` : ''} no tienen ventas en los últimos ${DIAS_VENTANA} días. Considera una oferta, destacarlos en la carta o revisar su precio y foto.`,
      })
    }

    if (variacion !== null && variacion <= -15) {
      recomendaciones.push({
        titulo: 'Las ventas van por debajo del mes anterior',
        texto: `Llevas ${dinero(totalMes)} contra ${dinero(totalMesAnterior)} en el mismo tramo del mes pasado (${variacion.toFixed(0)}%). Puede ser buen momento para una oferta relámpago o reactivar clientes por WhatsApp.`,
      })
    } else if (variacion !== null && variacion >= 15) {
      recomendaciones.push({
        titulo: 'Vas mejor que el mes pasado',
        texto: `Llevas ${dinero(totalMes)}, un ${variacion.toFixed(0)}% más que en el mismo tramo del mes anterior. Mantén lo que está funcionando y evita quedarte sin stock de los productos más pedidos.`,
      })
    }
  }

  return {
    mes: nombreMes(ahora),
    totalMes,
    pedidosMes,
    totalMesAnterior,
    variacion,
    ticketPromedio,
    porDia,
    maxPedidosDia,
    topProductos: topProductos.slice(0, 5).filter((p) => p.unidadesMejorDia >= MIN_UNIDADES_PRODUCTO_DIA),
    suficientesDatos,
    diasVentana: DIAS_VENTANA,
    recomendaciones,
    dinero,
  }
}
