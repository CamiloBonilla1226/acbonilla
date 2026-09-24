import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Gestiona grupos_opciones + opciones de un producto puntual (usado en el panel admin
// para configurar adiciones/variantes). No estaba en la lista original de hooks del
// brief, pero es necesario para el punto 8 ("gestión de adiciones") con el mismo patrón
// fetch + CRUD que useProductos/useCategorias/usePedidos.
export function useGruposOpciones(productoId) {
  const [grupos, setGrupos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    if (!productoId) {
      setGrupos([])
      setCargando(false)
      return
    }

    setCargando(true)
    setError(null)

    const { data, error: errorConsulta } = await supabase
      .from('grupos_opciones')
      .select('*, opciones(*)')
      .eq('producto_id', productoId)
      .order('nombre', { ascending: true })

    if (errorConsulta) {
      setError(errorConsulta)
      setGrupos([])
    } else {
      setGrupos(data)
    }
    setCargando(false)
  }, [productoId])

  useEffect(() => {
    recargar()
  }, [recargar])

  const crearGrupo = useCallback(
    async (grupo) => {
      const { error: errorCrear } = await supabase
        .from('grupos_opciones')
        .insert({ ...grupo, producto_id: productoId })
      if (!errorCrear) await recargar()
      return { exito: !errorCrear, error: errorCrear }
    },
    [productoId, recargar]
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
