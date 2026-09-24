import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'

// Catálogo plano de adiciones del negocio (ej. "Gomitas", "Queso doble"): cada adición es
// independiente, con su propio precio, y siempre opcional al pedir cualquier producto —
// no hay grupos ni obligatoriedad (eso reemplazó al modelo anterior de
// grupos_opciones/opciones, ver CHANGELOG.md).
export function useAdiciones() {
  const [adiciones, setAdiciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)

    const { data, error: errorConsulta } = await supabase
      .from('adiciones')
      .select('*')
      .eq('negocio_id', negocioConfig.negocioId)
      .order('nombre', { ascending: true })

    if (errorConsulta) {
      setError(errorConsulta)
      setAdiciones([])
    } else {
      setAdiciones(data)
    }
    setCargando(false)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const crearAdicion = useCallback(
    async (adicion) => {
      const nombreLimpio = adicion.nombre?.trim() ?? ''
      if (!nombreLimpio) {
        return { exito: false, error: new Error('El nombre es obligatorio.') }
      }

      const { data: existente, error: errorConsulta } = await supabase
        .from('adiciones')
        .select('id')
        .eq('negocio_id', negocioConfig.negocioId)
        .ilike('nombre', nombreLimpio)
        .maybeSingle()

      if (errorConsulta) return { exito: false, error: errorConsulta }
      if (existente) {
        return { exito: false, error: new Error('Ya existe una adición con ese nombre.') }
      }

      const { error: errorCrear } = await supabase
        .from('adiciones')
        .insert({ ...adicion, nombre: nombreLimpio, negocio_id: negocioConfig.negocioId })

      if (!errorCrear) await recargar()
      return { exito: !errorCrear, error: errorCrear }
    },
    [recargar]
  )

  const actualizarAdicion = useCallback(
    async (id, cambiosOriginales) => {
      let cambios = cambiosOriginales

      if (cambios.nombre !== undefined) {
        const nombreLimpio = cambios.nombre.trim()
        if (!nombreLimpio) {
          return { exito: false, error: new Error('El nombre es obligatorio.') }
        }

        const { data: existente, error: errorConsulta } = await supabase
          .from('adiciones')
          .select('id')
          .eq('negocio_id', negocioConfig.negocioId)
          .neq('id', id)
          .ilike('nombre', nombreLimpio)
          .maybeSingle()

        if (errorConsulta) return { exito: false, error: errorConsulta }
        if (existente) {
          return { exito: false, error: new Error('Ya existe una adición con ese nombre.') }
        }

        cambios = { ...cambios, nombre: nombreLimpio }
      }

      const { error: errorActualizar } = await supabase.from('adiciones').update(cambios).eq('id', id)

      if (!errorActualizar) await recargar()
      return { exito: !errorActualizar, error: errorActualizar }
    },
    [recargar]
  )

  const eliminarAdicion = useCallback(
    async (id) => {
      const { error: errorEliminar } = await supabase.from('adiciones').delete().eq('id', id)

      if (!errorEliminar) await recargar()
      return { exito: !errorEliminar, error: errorEliminar }
    },
    [recargar]
  )

  return { adiciones, cargando, error, recargar, crearAdicion, actualizarAdicion, eliminarAdicion }
}
