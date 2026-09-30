import { useNegocioConfig } from '../../hooks/useNegocioConfig'
import { agruparHorario, DIAS } from '../../lib/horario'

const REDES = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['whatsapp', 'WhatsApp'],
]

// Contenido propio de cada negocio (descripción, horario, dirección, redes), leído de la
// tabla `negocio_config` (ver useNegocioConfig.js) para que cada negocio lo edite desde su
// panel admin sin tocar código. Si el negocio todavía no llenó nada de esto, la sección
// entera no se muestra en vez de dejar espacios vacíos.
//
// Diseño compacto: una fila por dato (horario / ubicación / redes) en vez de un bloque con
// título cada uno. El horario muestra solo el de hoy y se despliega para ver la semana.
export function SobreNosotros() {
  const { config, cargando } = useNegocioConfig()
  if (cargando || !config) return null

  const { descripcion, direccion, horario, redes_sociales: redesSociales } = config
  const redesConLink = REDES.filter(([clave]) => redesSociales?.[clave])
  const gruposHorario = agruparHorario(horario)

  if (!descripcion && !direccion && gruposHorario.length === 0 && redesConLink.length === 0) return null

  const hoy = DIAS[new Date().getDay()]
  const grupoHoy = gruposHorario.find((grupo) => grupo.claves.includes(hoy))

  return (
    <section className="sobre-nosotros">
      <h2>Sobre nosotros</h2>
      {descripcion && <p className="sobre-nosotros__descripcion">{descripcion}</p>}

      <ul className="sobre-nosotros__filas">
        {gruposHorario.length > 0 && (
          <li>
            <details className="sobre-nosotros__horario">
              <summary>
                <span className="sobre-nosotros__etiqueta">Horario</span>
                <span className="sobre-nosotros__valor">
                  {grupoHoy ? `Hoy · ${grupoHoy.texto}` : 'Ver horario'}
                </span>
                <span className="sobre-nosotros__flecha" aria-hidden="true">
                  ▾
                </span>
              </summary>
              <ul className="sobre-nosotros__semana">
                {gruposHorario.map((grupo) => (
                  <li key={grupo.etiquetaDias}>
                    <span>{grupo.etiquetaDias}</span>
                    <span className="texto-suave">{grupo.texto}</span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        )}

        {direccion && (
          <li>
            <a
              className="sobre-nosotros__fila"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="sobre-nosotros__etiqueta">Ubicación</span>
              <span className="sobre-nosotros__valor">{direccion}</span>
              <span className="sobre-nosotros__flecha" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        )}

        {redesConLink.length > 0 && (
          <li className="sobre-nosotros__fila">
            <span className="sobre-nosotros__etiqueta">Redes</span>
            <span className="sobre-nosotros__redes">
              {redesConLink.map(([clave, etiqueta]) => (
                <a key={clave} href={redesSociales[clave]} target="_blank" rel="noreferrer">
                  {etiqueta}
                </a>
              ))}
            </span>
          </li>
        )}
      </ul>
    </section>
  )
}
