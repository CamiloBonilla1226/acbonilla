import { useMemo } from 'react'
import { analizarNegocio } from '../../lib/analisisNegocio'

const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1)

// Panel de análisis del dashboard: dinero del mes, pedidos por día de la semana, productos y
// recomendaciones. Todo se calcula con los pedidos ya cargados (ver lib/analisisNegocio.js).
export function AsistenteNegocio({ pedidos, productos, cargando }) {
  const analisis = useMemo(() => analizarNegocio(pedidos, productos), [pedidos, productos])

  if (cargando) return null

  // La semana se muestra de lunes a domingo (getDay() empieza en domingo).
  const semana = [...analisis.porDia.slice(1), analisis.porDia[0]]
  const { variacion } = analisis

  return (
    <section className="asistente" aria-labelledby="asistente-titulo">
      <h2 id="asistente-titulo" className="asistente__titulo">
        Asistente del negocio
      </h2>

      <div className="tarjeta asistente__dinero">
        <span className="texto-suave">Ventas de {analisis.mes}</span>
        <strong>{analisis.dinero(analisis.totalMes)}</strong>
        <div className="asistente__dinero-detalle">
          <span>{analisis.pedidosMes} pedidos</span>
          <span>Promedio {analisis.dinero(analisis.ticketPromedio)}</span>
          {variacion !== null && (
            <span className={variacion >= 0 ? 'asistente__sube' : 'asistente__baja'}>
              {variacion >= 0 ? '▲' : '▼'} {Math.abs(variacion).toFixed(0)}% vs. mes anterior
            </span>
          )}
        </div>
        <span className="asistente__nota">No incluye pedidos rechazados.</span>
      </div>

      <div className="tarjeta asistente__bloque">
        <h3>Pedidos por día de la semana</h3>
        <p className="asistente__nota">Últimos {analisis.diasVentana} días.</p>
        <ul className="asistente__barras">
          {semana.map((dia) => (
            <li key={dia.nombre} className="asistente__barra-fila">
              <span className="asistente__barra-dia">{mayuscula(dia.nombre).slice(0, 3)}</span>
              <span className="asistente__barra-pista">
                <span
                  className={`asistente__barra${
                    analisis.maxPedidosDia > 0 && dia.pedidos === analisis.maxPedidosDia ? ' asistente__barra--max' : ''
                  }`}
                  style={{ width: `${analisis.maxPedidosDia > 0 ? (dia.pedidos / analisis.maxPedidosDia) * 100 : 0}%` }}
                />
              </span>
              <span className="asistente__barra-valor">{dia.pedidos}</span>
            </li>
          ))}
        </ul>
      </div>

      {analisis.topProductos.length > 0 && (
        <div className="tarjeta asistente__bloque">
          <h3>Qué día se compra más cada producto</h3>
          <ul className="asistente__productos">
            {analisis.topProductos.map((producto) => (
              <li key={producto.nombre}>
                <span className="asistente__producto-nombre">{producto.nombre}</span>
                <span className="texto-suave">
                  {mayuscula(producto.mejorDia)} · {producto.unidadesMejorDia} de {producto.unidades} uds.
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="asistente__recomendaciones">
        <h3>Recomendaciones</h3>
        {analisis.recomendaciones.map((recomendacion) => (
          <article key={recomendacion.titulo} className="tarjeta asistente__recomendacion">
            <strong>{recomendacion.titulo}</strong>
            <p>{recomendacion.texto}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
