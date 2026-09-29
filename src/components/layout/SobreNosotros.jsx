import { useNegocioConfig } from '../../hooks/useNegocioConfig'
import { agruparHorario } from '../../lib/horario'

const REDES = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['whatsapp', 'WhatsApp'],
]

// Contenido propio de cada negocio (descripción, horario, dirección, redes), leído de la
// tabla `negocio_config` (ver useNegocioConfig.js) para que cada negocio lo edite desde su
// panel admin sin tocar código. Si el negocio todavía no llenó nada de esto, la sección
// entera no se muestra en vez de dejar espacios vacíos.
export function SobreNosotros() {
  const { config, cargando } = useNegocioConfig()
  if (cargando || !config) return null

  const { descripcion, direccion, horario, redes_sociales: redesSociales } = config
  const redesConLink = REDES.filter(([clave]) => redesSociales?.[clave])
  const gruposHorario = agruparHorario(horario)

  if (!descripcion && !direccion && gruposHorario.length === 0 && redesConLink.length === 0) return null

  return (
    <section className="sobre-nosotros">
      <h2>Sobre nosotros</h2>
      {descripcion && <p>{descripcion}</p>}

      {gruposHorario.length > 0 && (
        <>
          <h3 className="sobre-nosotros__subtitulo">Horario</h3>
          <ul className="sobre-nosotros__horario">
            {gruposHorario.map((grupo) => (
              <li key={grupo.etiquetaDias}>
                <span>{grupo.etiquetaDias}</span>
                <span className="texto-suave">{grupo.texto}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {direccion && (
        <>
          <h3 className="sobre-nosotros__subtitulo">Ubicación</h3>
          <a
            className="texto-suave sobre-nosotros__direccion"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
            target="_blank"
            rel="noreferrer"
          >
            {direccion}
          </a>
        </>
      )}

      {redesConLink.length > 0 && (
        <>
          <h3 className="sobre-nosotros__subtitulo">Redes sociales</h3>
          <div className="sobre-nosotros__redes">
            {redesConLink.map(([clave, etiqueta]) => (
              <a key={clave} href={redesSociales[clave]} target="_blank" rel="noreferrer">
                {etiqueta}
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
