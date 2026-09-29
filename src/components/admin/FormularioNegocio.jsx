import { useEffect, useState } from 'react'
import { Interruptor } from './Interruptor'
import { DIAS_ORDEN_SEMANA, ETIQUETA_DIA } from '../../lib/horario'

const DIAS_FORMULARIO = DIAS_ORDEN_SEMANA
const OFERTA_TITULO_MAX = 60
const OFERTA_SUBTITULO_MAX = 30

function horarioVacio() {
  return Object.fromEntries(DIAS_FORMULARIO.map((dia) => [dia, { cerrado: true, abre: '10:00', cierra: '22:00' }]))
}

// Edita negocios.configuracion completa (descripción, dirección, redes, horario) en un solo
// formulario — mismo criterio de "un solo paso" que ya usa FormularioProducto.jsx para
// producto + variantes. Se precarga cuando `configuracion` llega desde useNegocioConfig.js
// (puede tardar un tick porque viene de una consulta async).
export function FormularioNegocio({ configuracion, onGuardar }) {
  const [descripcion, setDescripcion] = useState(configuracion?.descripcion ?? '')
  const [direccion, setDireccion] = useState(configuracion?.direccion ?? '')
  const [redes, setRedes] = useState({
    instagram: configuracion?.redes_sociales?.instagram ?? '',
    facebook: configuracion?.redes_sociales?.facebook ?? '',
    whatsapp: configuracion?.redes_sociales?.whatsapp ?? '',
  })
  const [oferta, setOferta] = useState({
    activa: configuracion?.oferta?.activa ?? false,
    titulo: configuracion?.oferta?.titulo ?? '',
    subtitulo: configuracion?.oferta?.subtitulo ?? '',
  })
  const [horario, setHorario] = useState(() => {
    const base = horarioVacio()
    for (const dia of DIAS_FORMULARIO) {
      const valor = configuracion?.horario?.[dia]
      if (valor?.abre && valor?.cierra) {
        base[dia] = { cerrado: false, abre: valor.abre, cierra: valor.cierra }
      }
    }
    return base
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  // Precarga una sola vez, cuando la configuración real termina de llegar (antes de eso
  // `configuracion` es undefined y los estados iniciales ya son los valores vacíos).
  useEffect(() => {
    if (!configuracion) return
    setDescripcion(configuracion.descripcion ?? '')
    setDireccion(configuracion.direccion ?? '')
    setRedes({
      instagram: configuracion.redes_sociales?.instagram ?? '',
      facebook: configuracion.redes_sociales?.facebook ?? '',
      whatsapp: configuracion.redes_sociales?.whatsapp ?? '',
    })
    setOferta({
      activa: configuracion.oferta?.activa ?? false,
      titulo: configuracion.oferta?.titulo ?? '',
      subtitulo: configuracion.oferta?.subtitulo ?? '',
    })
    const base = horarioVacio()
    for (const dia of DIAS_FORMULARIO) {
      const valor = configuracion.horario?.[dia]
      if (valor?.abre && valor?.cierra) {
        base[dia] = { cerrado: false, abre: valor.abre, cierra: valor.cierra }
      }
    }
    setHorario(base)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuracion])

  const actualizarDia = (dia, campo, valor) => {
    setHorario((actual) => ({ ...actual, [dia]: { ...actual[dia], [campo]: valor } }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    setGuardando(true)
    setError(null)

    const horarioFinal = Object.fromEntries(
      DIAS_FORMULARIO.map((dia) => [
        dia,
        horario[dia].cerrado ? null : { abre: horario[dia].abre, cierra: horario[dia].cierra },
      ])
    )

    const resultado = await onGuardar({
      descripcion: descripcion.trim() || null,
      direccion: direccion.trim() || null,
      redes_sociales: {
        instagram: redes.instagram.trim(),
        facebook: redes.facebook.trim(),
        whatsapp: redes.whatsapp.trim(),
      },
      horario: horarioFinal,
      oferta: {
        activa: oferta.activa,
        titulo: oferta.titulo.trim(),
        subtitulo: oferta.subtitulo.trim(),
      },
    })

    setGuardando(false)
    if (resultado && !resultado.exito) {
      setError(resultado.error?.message ?? 'No se pudo guardar la configuración.')
    }
  }

  return (
    <form className="checkout formulario-negocio" onSubmit={enviar} noValidate>
      <label className="campo">
        <span>Descripción corta</span>
        <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={200} />
      </label>

      <label className="campo">
        <span>Dirección</span>
        <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength={160} />
      </label>

      <label className="campo">
        <span>Instagram (URL)</span>
        <input
          type="url"
          value={redes.instagram}
          onChange={(e) => setRedes((r) => ({ ...r, instagram: e.target.value }))}
        />
      </label>

      <label className="campo">
        <span>Facebook (URL)</span>
        <input
          type="url"
          value={redes.facebook}
          onChange={(e) => setRedes((r) => ({ ...r, facebook: e.target.value }))}
        />
      </label>

      <label className="campo">
        <span>WhatsApp para mostrar en "Sobre nosotros" (URL, opcional)</span>
        <input
          type="url"
          value={redes.whatsapp}
          onChange={(e) => setRedes((r) => ({ ...r, whatsapp: e.target.value }))}
        />
      </label>

      <fieldset className="grupo-opciones formulario-negocio__oferta">
        <legend className="grupo-opciones__titulo">Tarjeta de oferta en Inicio</legend>
        <Interruptor
          activo={oferta.activa}
          etiqueta={oferta.activa ? 'Se muestra en Inicio' : 'No se muestra'}
          onCambiar={(valor) => setOferta((actual) => ({ ...actual, activa: valor }))}
        />

        {oferta.activa && (
          <>
            <label className="campo">
              <span>Título ({oferta.titulo.length}/{OFERTA_TITULO_MAX})</span>
              <input
                type="text"
                value={oferta.titulo}
                onChange={(e) => setOferta((actual) => ({ ...actual, titulo: e.target.value }))}
                maxLength={OFERTA_TITULO_MAX}
                placeholder="Ej. Gira la ruleta y gana un descuento en tu compra"
              />
            </label>

            <label className="campo">
              <span>Subtítulo, opcional ({oferta.subtitulo.length}/{OFERTA_SUBTITULO_MAX})</span>
              <input
                type="text"
                value={oferta.subtitulo}
                onChange={(e) => setOferta((actual) => ({ ...actual, subtitulo: e.target.value }))}
                maxLength={OFERTA_SUBTITULO_MAX}
                placeholder="Ej. Compras desde $70.000"
              />
            </label>
          </>
        )}
      </fieldset>

      <fieldset className="grupo-opciones formulario-negocio__horario">
        <legend className="grupo-opciones__titulo">Horario de atención</legend>
        {DIAS_FORMULARIO.map((dia) => (
          <div key={dia} className="formulario-negocio__dia">
            <span className="formulario-negocio__dia-nombre">{ETIQUETA_DIA[dia]}</span>
            <Interruptor
              activo={!horario[dia].cerrado}
              etiqueta={horario[dia].cerrado ? 'Cerrado' : 'Abierto'}
              onCambiar={(valor) => actualizarDia(dia, 'cerrado', !valor)}
            />
            {!horario[dia].cerrado && (
              <div className="formulario-negocio__dia-horas">
                <input
                  type="time"
                  value={horario[dia].abre}
                  onChange={(e) => actualizarDia(dia, 'abre', e.target.value)}
                />
                <span>a</span>
                <input
                  type="time"
                  value={horario[dia].cierra}
                  onChange={(e) => actualizarDia(dia, 'cierra', e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </fieldset>

      {error && <p className="campo__error">{error}</p>}

      <button type="submit" className="boton" disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}
