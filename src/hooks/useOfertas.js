import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'
import { MONTO_DOMICILIO_POR_DEFECTO, TIPO_DOMICILIO_GRATIS, textoDomicilioGratis } from '../lib/tiposOferta'

export const OFERTA_TITULO_MAX = 38
export const OFERTA_SUBTITULO_MAX = 22

const ahora = () => new Date().toISOString()
const esDomicilio = (oferta) => oferta.tipo === TIPO_DOMICILIO_GRATIS

function validarTextos({ titulo, subtitulo }) {
  const tituloLimpio = titulo?.trim() ?? ''
  if (!tituloLimpio) return 'El título es obligatorio.'
  if (tituloLimpio.length > OFERTA_TITULO_MAX) return `El título admite hasta ${OFERTA_TITULO_MAX} caracteres.`
  if ((subtitulo?.trim() ?? '').length > OFERTA_SUBTITULO_MAX) {
    return `La descripción admite hasta ${OFERTA_SUBTITULO_MAX} caracteres.`
  }
  return null
}

const sinPermiso = (data, accion) => (data?.length ? null : new Error(`No tienes permiso para ${accion} esta oferta.`))

// Ofertas del negocio (tabla ofertas, ver explicacion-script-bd.txt sección 17). Varias
// pueden estar activas (todas aplican su comportamiento); solo una (`en_inicio`) se muestra en
// la tarjeta de Inicio. "Domicilio gratis" es una oferta fija: en el panel se crea sola si el
// negocio todavía no la tiene, no se elimina y solo se le cambia el monto. Las demás las crea
// el dueño, solo con título y descripción. Con `soloActivas` la usa la carta pública (el RLS
// igual solo le deja leer las activas) y nunca crea nada.
export function useOfertas({ soloActivas = false } = {}) {
  const [ofertas, setOfertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const creandoDomicilio = useRef(false)

  const recargar = useCallback(
    async (silencioso = false) => {
      if (!silencioso) setCargando(true)
      setError(null)

      let consulta = supabase
        .from('ofertas')
        .select('*')
        .eq('negocio_id', negocioConfig.negocioId)
        .order('en_inicio', { ascending: false })
        .order('activa', { ascending: false })
        .order('creado_en', { ascending: false })
      if (soloActivas) consulta = consulta.eq('activa', true)

      const { data, error: errorConsulta } = await consulta
      if (errorConsulta) {
        setError(errorConsulta)
        setOfertas([])
      } else {
        setOfertas(data)
      }
      setCargando(false)
    },
    [soloActivas]
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  // Garantiza que exista la oferta fija de domicilio gratis (inactiva, con un monto por
  // defecto que el dueño ajusta). La base de datos además impide tener dos (índice único).
  useEffect(() => {
    if (soloActivas || cargando || error || creandoDomicilio.current || ofertas.some(esDomicilio)) return
    creandoDomicilio.current = true
    const monto = MONTO_DOMICILIO_POR_DEFECTO
    supabase
      .from('ofertas')
      .insert({
        negocio_id: negocioConfig.negocioId,
        tipo: TIPO_DOMICILIO_GRATIS,
        configuracion: { monto_minimo: monto },
        activa: false,
        ...textoDomicilioGratis(monto),
      })
      .then(() => recargar(true))
  }, [soloActivas, cargando, error, ofertas, recargar])

  const ponerEnInicio = useCallback(
    async (id) => {
      const { error: errorRpc } = await supabase.rpc('poner_oferta_en_inicio', { p_oferta: id })
      await recargar(true)
      return { exito: !errorRpc, error: errorRpc }
    },
    [recargar]
  )

  // Una oferta nueva activa queda en Inicio si todavía no hay ninguna ahí, para que al crear
  // la primera no haya que hacer un paso extra.
  const crearOferta = useCallback(
    async ({ titulo, subtitulo, activa }) => {
      const mensaje = validarTextos({ titulo, subtitulo })
      if (mensaje) return { exito: false, error: new Error(mensaje) }

      const { data, error: errorCrear } = await supabase
        .from('ofertas')
        .insert({
          negocio_id: negocioConfig.negocioId,
          titulo: titulo.trim(),
          subtitulo: subtitulo?.trim() || null,
          tipo: 'informativa',
          activa,
        })
        .select()
        .single()
      if (errorCrear) return { exito: false, error: errorCrear }

      if (data.activa && !ofertas.some((oferta) => oferta.en_inicio)) return ponerEnInicio(data.id)
      await recargar(true)
      return { exito: true }
    },
    [ofertas, ponerEnInicio, recargar]
  )

  const actualizarOferta = useCallback(
    async (id, { titulo, subtitulo }) => {
      const mensaje = validarTextos({ titulo, subtitulo })
      if (mensaje) return { exito: false, error: new Error(mensaje) }

      const { data, error: errorActualizar } = await supabase
        .from('ofertas')
        .update({ titulo: titulo.trim(), subtitulo: subtitulo?.trim() || null, actualizado_en: ahora() })
        .eq('id', id)
        .select('id')
      const error = errorActualizar ?? sinPermiso(data, 'editar')
      await recargar(true)
      return { exito: !error, error }
    },
    [recargar]
  )

  // Lo único configurable de la oferta de domicilio gratis: el monto. El texto de la tarjeta
  // se recalcula con él.
  const configurarDomicilio = useCallback(
    async (id, montoTexto) => {
      const monto = Math.round(Number(montoTexto))
      if (!(monto > 0)) return { exito: false, error: new Error('Ingresa una compra mínima mayor a 0.') }

      const { data, error: errorActualizar } = await supabase
        .from('ofertas')
        .update({ configuracion: { monto_minimo: monto }, ...textoDomicilioGratis(monto), actualizado_en: ahora() })
        .eq('id', id)
        .select('id')
      const error = errorActualizar ?? sinPermiso(data, 'editar')
      await recargar(true)
      return { exito: !error, error }
    },
    [recargar]
  )

  const eliminarOferta = useCallback(
    async (id) => {
      if (ofertas.some((oferta) => oferta.id === id && esDomicilio(oferta))) {
        return { exito: false, error: new Error('La oferta de domicilio gratis no se puede eliminar; puedes desactivarla.') }
      }
      const { data, error: errorEliminar } = await supabase.from('ofertas').delete().eq('id', id).select('id')
      const error = errorEliminar ?? sinPermiso(data, 'eliminar')
      await recargar(true)
      return { exito: !error, error }
    },
    [ofertas, recargar]
  )

  // Desactivar también la quita de Inicio (la base de datos no deja una oferta en Inicio
  // sin estar activa). Activar la pone en Inicio solo si no hay ninguna ahí.
  const cambiarActiva = useCallback(
    async (id, valor) => {
      const cambios = valor ? { activa: true } : { activa: false, en_inicio: false }
      const { error: errorActualizar } = await supabase
        .from('ofertas')
        .update({ ...cambios, actualizado_en: ahora() })
        .eq('id', id)
      if (errorActualizar) return { exito: false, error: errorActualizar }

      if (valor && !ofertas.some((oferta) => oferta.en_inicio && oferta.id !== id)) return ponerEnInicio(id)
      await recargar(true)
      return { exito: true }
    },
    [ofertas, ponerEnInicio, recargar]
  )

  return {
    ofertas,
    ofertaDomicilio: ofertas.find(esDomicilio) ?? null,
    otrasOfertas: ofertas.filter((oferta) => !esDomicilio(oferta)),
    ofertaEnInicio: ofertas.find((oferta) => oferta.en_inicio && oferta.activa) ?? null,
    cargando,
    error,
    recargar,
    crearOferta,
    actualizarOferta,
    configurarDomicilio,
    eliminarOferta,
    cambiarActiva,
    ponerEnInicio,
  }
}
