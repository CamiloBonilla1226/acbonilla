import { FiltrosAdmin, GrupoFiltro } from './FiltrosAdmin'

// Los pedidos se pueden consultar como máximo 30 días hacia atrás: el rango "desde/hasta"
// nunca sale de esa ventana (los inputs de fecha tienen min/max y, además, aplicarFiltros
// recorta cualquier valor fuera de ella).
export const DIAS_MAXIMOS = 30
const MS_DIA = 24 * 60 * 60 * 1000

// Fecha local en formato YYYY-MM-DD (lo que usa <input type="date">), sin pasar por UTC.
function aTexto(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

function haceDias(dias) {
  return aTexto(new Date(Date.now() - dias * MS_DIA))
}

export function filtrosPedidosIniciales() {
  return { rapido: '30', desde: haceDias(DIAS_MAXIMOS), hasta: aTexto(new Date()) }
}

export function aplicarFiltrosPedidos(pedidos, filtros) {
  const minimo = haceDias(DIAS_MAXIMOS)
  const maximo = aTexto(new Date())
  const desde = filtros.desde && filtros.desde > minimo ? filtros.desde : minimo
  const hasta = filtros.hasta && filtros.hasta < maximo ? filtros.hasta : maximo

  return pedidos.filter((pedido) => {
    const dia = aTexto(new Date(pedido.creado_en))
    return dia >= desde && dia <= hasta
  })
}

const RANGOS_RAPIDOS = {
  hoy: () => ({ desde: haceDias(0), hasta: haceDias(0) }),
  ayer: () => ({ desde: haceDias(1), hasta: haceDias(1) }),
  7: () => ({ desde: haceDias(6), hasta: haceDias(0) }),
  30: () => ({ desde: haceDias(DIAS_MAXIMOS), hasta: haceDias(0) }),
}

export function FiltrosPedidos({ filtros, onCambiar, total, mostrados }) {
  const minimo = haceDias(DIAS_MAXIMOS)
  const maximo = aTexto(new Date())

  const elegirRapido = (clave) => onCambiar({ rapido: clave, ...RANGOS_RAPIDOS[clave]() })

  const cambiarFecha = (campo) => (evento) => {
    const nuevo = { ...filtros, rapido: 'personalizado', [campo]: evento.target.value }
    // Si el rango queda invertido, el otro extremo se ajusta para que siga siendo válido.
    if (nuevo.desde && nuevo.hasta && nuevo.desde > nuevo.hasta) {
      if (campo === 'desde') nuevo.hasta = nuevo.desde
      else nuevo.desde = nuevo.hasta
    }
    onCambiar(nuevo)
  }

  return (
    <FiltrosAdmin
      total={total}
      mostrados={mostrados}
      activos={filtros.rapido !== '30' ? 1 : 0}
      onLimpiar={() => onCambiar(filtrosPedidosIniciales())}
    >
      <GrupoFiltro
        titulo="Periodo"
        valor={filtros.rapido}
        onCambiar={elegirRapido}
        opciones={[
          { valor: 'hoy', texto: 'Hoy' },
          { valor: 'ayer', texto: 'Ayer' },
          { valor: '7', texto: '7 días' },
          { valor: '30', texto: '30 días' },
        ]}
      />
      <div className="filtros-admin__grupo">
        <span className="filtros-admin__titulo">Rango (máx. 30 días)</span>
        <div className="filtros-admin__fechas">
          <label className="filtros-admin__fecha">
            <span>Desde</span>
            <input type="date" value={filtros.desde} min={minimo} max={maximo} onChange={cambiarFecha('desde')} />
          </label>
          <label className="filtros-admin__fecha">
            <span>Hasta</span>
            <input type="date" value={filtros.hasta} min={minimo} max={maximo} onChange={cambiarFecha('hasta')} />
          </label>
        </div>
      </div>
    </FiltrosAdmin>
  )
}
