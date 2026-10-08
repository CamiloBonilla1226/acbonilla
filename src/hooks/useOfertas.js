import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'
import { validarConfiguracion } from '../lib/tiposOferta'

export const OFERTA_TITULO_MAX = 38
export const OFERTA_SUBTITULO_MAX = 22

function validar({ titulo, subtitulo, tipo, configuracion }) {
  const tituloLimpio = titulo?.trim() ?? ''
  if (!tituloLimpio) return 'El título es obligatorio.'
  if (tituloLimpio.length > OFERTA_TITULO_MAX) return `El título admite hasta ${OFERTA_TITULO_MAX} caracteres.`
  if ((subtitulo?.trim() ?? '').length > OFERTA_SUBTITULO_MAX) {
    return `El subtítulo admite hasta ${OFERTA_SUBTITULO_MAX} caracteres.`
  }
  return validarConfiguracion(tipo, configuracion ?? {})
}

const limpiar = (datos) => ({
  titulo: datos.titulo.trim(),
  subtitulo: datos.subtitulo?.trim() || null,
  tipo: datos.tipo,
  configuracion: datos.configuracion ?? {},
})

// Ofertas del negocio (tabla ofertas, ver explicacion-script-bd.txt sección 17). Varias
// pueden estar activas; solo una (`en_inicio`) se muestra en la tarjeta de Inicio. Con
// `soloActivas` la usa la carta pública (el RLS igual solo le deja leer las activas).
export function useOfertas({ soloActivas = false } = {}) {
  const [ofertas, setOfertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

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

  const ponerEnInicio = useCallback(
    async (id) => {
      const { error: errorRpc } = await supabase.rpc('poner_oferta_en_inicio', { p_oferta: id })
      await recargar(true)
      return { exito: !errorRpc, error: errorRpc }
    },
    [recargar]
  )

  // Una oferta nueva activa queda en Inicio si todavía no hay ninguna ahí, para que al
  // crear la primera no haya que hacer un paso extra.
  const crearOferta = useCallback(
    async (datos) => {
      const mensaje = validar(datos)
      if (mensaje) return { exito: false, error: new Error(mensaje) }

      const { data, error: errorCrear } = await supabase
        .from('ofertas')
        .insert({ ...limpiar(datos), activa: datos.activa, negocio_id: negocioConfig.negocioId })
        .select()
        .single()
      if (errorCrear) return { exito: false, error: errorCrear }

      if (data.activa && !ofertas.some((oferta) => oferta.en_inicio)) {
        return ponerEnInicio(data.id)
      }
      await recargar(true)
      return { exito: true }
    },
    [ofertas, ponerEnInicio, recargar]
  )

  const actualizarOferta = useCallback(
    async (id, datos) => {
      const mensaje = validar(datos)
      if (mensaje) return { exito: false, error: new Error(mensaje) }

      const { data, error: errorActualizar } = await supabase
        .from('ofertas')
        .update({ ...limpiar(datos), actualizado_en: new Date().toISOString() })
        .eq('id', id)
        .select('id')
      const error = errorActualizar ?? (data?.length ? null : new Error('No tienes permiso para editar esta oferta.'))
      await recargar(true)
      return { exito: !error, error }
    },
    [recargar]
  )

  const eliminarOferta = useCallback(
    async (id) => {
      const { data, error: errorEliminar } = await supabase.from('ofertas').delete().eq('id', id).select('id')
      const error = errorEliminar ?? (data?.length ? null : new Error('No tienes permiso para eliminar esta oferta.'))
      await recargar(true)
      return { exito: !error, error }
    },
    [recargar]
  )

  // Desactivar también la quita de Inicio (la base de datos no deja una oferta en Inicio
  // sin estar activa). Activar la pone en Inicio solo si no hay ninguna ahí.
  const cambiarActiva = useCallback(
    async (id, valor) => {
      const cambios = valor ? { activa: true } : { activa: false, en_inicio: false }
      const { error: errorActualizar } = await supabase
        .from('ofertas')
        .update({ ...cambios, actualizado_en: new Date().toISOString() })
        .eq('id', id)
      if (errorActualizar) return { exito: false, error: errorActualizar }

      if (valor && !ofertas.some((oferta) => oferta.en_inicio && oferta.id !== id)) {
        return ponerEnInicio(id)
      }
      await recargar(true)
      return { exito: true }
    },
    [ofertas, ponerEnInicio, recargar]
  )

  return {
    ofertas,
    ofertaEnInicio: ofertas.find((oferta) => oferta.en_inicio && oferta.activa) ?? null,
    cargando,
    error,
    recargar,
    crearOferta,
    actualizarOferta,
    eliminarOferta,
    cambiarActiva,
    ponerEnInicio,
  }
}
