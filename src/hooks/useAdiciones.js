import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { negocioConfig } from '../config/negocio.config'

// Catálogo de adiciones/variantes del NEGOCIO completo (ej. "Adiciones", "Tamaño"): ya no
// pertenecen a un producto puntual (antes grupos_opciones.producto_id), sino al negocio
// (grupos_opciones.negocio_id), para que cualquier producto pueda ofrecer cualquier
// adición sin tener que asignarlas una por una. Ver CHANGELOG.md para el porqué y la
// migración de base de datos que este cambio requirió.
export function useAdiciones() {
  const [grupos, setGrupos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)

    const { data, error: errorConsulta } = await supabase
      .from('grupos_opciones')
      .select('*, opciones(*)')
      .eq('negocio_id', negocioConfig.negocioId)
      .order('nombre', { ascending: true })

    if (errorConsulta) {
      setError(errorConsulta)
      setGrupos([])
    } else {
      setGrupos(data)
    }
    setCargando(false)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const crearGrupo = useCallback(
    async (grupo) => {
      const { error: errorCrear } = await supabase
        .from('grupos_opciones')
        .insert({ ...grupo, negocio_id: negocioConfig.negocioId })
      if (!errorCrear) await recargar()
      return { exito: !errorCrear, error: errorCrear }
    },
    [recargar]
  )

  const eliminarGrupo = useCallback(
    async (id) => {
      const { error: errorEliminar } = await supabase.from('grupos_opciones').delete().eq('id', id)
      if (!errorEliminar) await recargar()
      return { exito: !errorEliminar, error: errorEliminar }
    },
    [recargar]
  )

  const crearOpcion = useCallback(
    async (grupoOpcionesId, opcion) => {
      const { error: errorCrear } = await supabase
        .from('opciones')
        .insert({ ...opcion, grupo_opciones_id: grupoOpcionesId })
      if (!errorCrear) await recargar()
      return { exito: !errorCrear, error: errorCrear }
    },
    [recargar]
  )

  const eliminarOpcion = useCallback(
    async (id) => {
      const { error: errorEliminar } = await supabase.from('opciones').delete().eq('id', id)
      if (!errorEliminar) await recargar()
      return { exito: !errorEliminar, error: errorEliminar }
    },
    [recargar]
  )

  return { grupos, cargando, error, recargar, crearGrupo, eliminarGrupo, crearOpcion, eliminarOpcion }
}
