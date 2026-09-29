// Calcula si el negocio está abierto ahora mismo, a partir de negocio_config.horario
// (ver useNegocioConfig.js). Formato esperado por día: { abre: 'HH:mm', cierra: 'HH:mm' } o null/
// ausente si ese día no atiende. Devuelve null (en vez de 'cerrado') cuando no hay horario
// configurado todavía, para que el header no muestre un badge "Cerrado" incorrecto en
// negocios que aún no llenaron esa configuración.
const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

function minutosDesdeMedianoche(horaTexto) {
  const [horas, minutos] = horaTexto.split(':').map(Number)
  return horas * 60 + minutos
}

export function calcularEstadoAbierto(horario, ahora = new Date()) {
  if (!horario || Object.keys(horario).length === 0) return null

  const diaHoy = DIAS[ahora.getDay()]
  const horarioHoy = horario[diaHoy]

  if (!horarioHoy || !horarioHoy.abre || !horarioHoy.cierra) return 'cerrado'

  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()
  const abre = minutosDesdeMedianoche(horarioHoy.abre)
  const cierra = minutosDesdeMedianoche(horarioHoy.cierra)

  return minutosAhora >= abre && minutosAhora < cierra ? 'abierto' : 'cerrado'
}

// Orden de despliegue (lunes a domingo) y nombres, compartidos entre el formulario admin
// (FormularioNegocio.jsx) y la vista pública (SobreNosotros.jsx) para que ambos hablen de los
// mismos días con el mismo texto.
export const DIAS_ORDEN_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

export const ETIQUETA_DIA = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

function formatearHora12(horaTexto) {
  const [horas, minutos] = horaTexto.split(':').map(Number)
  const periodo = horas >= 12 ? 'pm' : 'am'
  const hora12 = horas % 12 || 12
  return `${hora12}:${String(minutos).padStart(2, '0')}${periodo}`
}

// Agrupa los días que comparten exactamente el mismo horario (o los mismos días cerrados)
// en una sola línea, sin importar si son consecutivos — ej. lunes y miércoles con el mismo
// horario se juntan aunque martes tenga uno distinto en el medio: "Lunes, Miércoles ·
// 5:00pm - 1:00am" / "Martes, Jueves · Cerrado", en vez de una fila idéntica por cada día.
// Cada grupo aparece en el orden en que su horario se ve por primera vez en la semana
// (Map conserva el orden de inserción de sus claves), y dentro del grupo los días quedan en
// orden natural (DIAS_ORDEN_SEMANA), no en el orden en que se repite el horario.
export function agruparHorario(horario) {
  if (!horario) return []

  const diasPorClave = new Map()
  for (const dia of DIAS_ORDEN_SEMANA) {
    const valor = horario[dia]
    const clave = valor?.abre && valor?.cierra ? `${valor.abre}-${valor.cierra}` : 'cerrado'

    if (!diasPorClave.has(clave)) diasPorClave.set(clave, [])
    diasPorClave.get(clave).push(dia)
  }

  return Array.from(diasPorClave.entries()).map(([clave, dias]) => {
    const primerDia = horario[dias[0]]
    return {
      etiquetaDias: dias.map((dia) => ETIQUETA_DIA[dia]).join(', '),
      texto: clave === 'cerrado' ? 'Cerrado' : `${formatearHora12(primerDia.abre)} - ${formatearHora12(primerDia.cierra)}`,
    }
  })
}

export { DIAS }
